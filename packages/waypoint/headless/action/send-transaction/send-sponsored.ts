import { fromBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { toServerError } from "../../error/server"
import { MessageSchema } from "../../proto/message"
import { Frame, Type } from "../../proto/rpc"
import { getAddressFromShard } from "../get-address"
import { sendAuthenticate, toAuthenticateData } from "../helpers/authenticate"
import { wasmGetSignHandler } from "../helpers/get-sign-handler"
import { createFrameQueue, openSocket } from "../helpers/open-socket"
import {
  sendProtocolData,
  wasmGetProtocolData,
  wasmReceiveProtocolData,
  wasmReceiveSession,
} from "../helpers/send-round-data"
import { wasmTriggerSign } from "../helpers/trigger-sign"
import { SendTransactionParams, SendTransactionResult } from "./common"
import { toTransactionInServerFormat } from "./prepare-tx"
import { sendTransactionRequest } from "./send-tx-request"
import { toTxHash } from "./to-tx-hash"

export const toSerializedSponsoredTransaction = (frame: Frame): Uint8Array => {
  try {
    if (frame.type === Type.DATA) {
      const message = fromBinary(MessageSchema, frame.data)

      return message.data
    }

    throw toServerError(frame)
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SendTransactionError,
      message: `Unable to get the serialized transaction from the server.`,
      cause: error,
    })
  }
}

export const sendSponsoredTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const {
    waypointToken,
    clientShard,
    chain,
    transaction,

    wasmUrl,
    wsUrl,
  } = params
  const address = getAddressFromShard(clientShard)
  const txInServerFormat = await toTransactionInServerFormat({
    chain,
    transaction,
    currentAddress: address,
  })
  console.debug("🔏 SEND TX: start")

  const signHandler = await wasmGetSignHandler(wasmUrl)
  console.debug("🔏 SEND TX: wasm is ready")

  const socket = await openSocket(`${wsUrl}/v1/public/ws/send`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔏 SEND TX: socket is ready")

  try {
    sendAuthenticate(socket, waypointToken)
    const authFrame = await waitAndDequeue()
    const authData = toAuthenticateData(authFrame)
    console.debug("🔏 SEND TX: authenticated", authData.uuid)

    sendTransactionRequest(socket, txInServerFormat, chain)
    console.debug("🔏 SEND TX: trigger socket sign")

    const serializedTxFrame = await waitAndDequeue()
    const serializedTx = toSerializedSponsoredTransaction(serializedTxFrame)

    const signResultPromise = wasmTriggerSign(signHandler, serializedTx, clientShard)
    console.debug("🔏 SEND TX: trigger wasm sign")

    const sessionFrame = await waitAndDequeue()
    wasmReceiveSession(signHandler, sessionFrame)

    const socketR1 = await waitAndDequeue()
    wasmReceiveProtocolData(signHandler, socketR1)
    console.debug("🔏 SEND TX: socket - round 1")

    const wasmR1 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR1)
    console.debug("🔏 SEND TX: wasm - round 1")

    const socketR2 = await waitAndDequeue()
    wasmReceiveProtocolData(signHandler, socketR2)
    console.debug("🔏 SEND TX: socket - round 2")

    const wasmR2 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR2)
    console.debug("🔏 SEND TX: wasm - round 2")

    const socketR3 = await waitAndDequeue()
    wasmReceiveProtocolData(signHandler, socketR3)
    console.debug("🔏 SEND TX: socket - round 3")

    const sessionR2Frame = await waitAndDequeue()
    wasmReceiveSession(signHandler, sessionR2Frame)

    const socketR4 = await waitAndDequeue()
    wasmReceiveProtocolData(signHandler, socketR4)
    console.debug("🔏 SEND TX: socket - round 4")

    const wasmR3 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR3)
    console.debug("🔏 SEND TX: wasm - round 3")

    const socketR5 = await waitAndDequeue()
    wasmReceiveProtocolData(signHandler, socketR5)
    console.debug("🔏 SEND TX: socket - round 5")

    const sendTransactionResponseFrame = await waitAndDequeue()
    const txHash = toTxHash(sendTransactionResponseFrame)

    const doneFrame = await waitAndDequeue()
    if (doneFrame.type === Type.DONE) {
      const signature = await signResultPromise

      console.debug("🔏 SEND TX: done")
      return {
        txHash: txHash,
        signature,
      }
    }

    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SendTransactionError,
      message: `Unable to get the transaction status from the server.`,
      cause: toServerError(doneFrame),
    })
  } finally {
    socket.close()
  }
}
