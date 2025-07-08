import { keccak256 } from "viem"

import { decodeServerError } from "../../error/server"
import { Type } from "../../proto/rpc"
import { createTracker, HeadlessEventName } from "../../track/track"
import { getAddressFromShard } from "../get-address"
import { decodeAuthenticateData, sendAuthenticate } from "../helpers/authenticate"
import { wasmGetSignHandler } from "../helpers/get-sign-handler"
import { createFrameQueue, openSocket } from "../helpers/open-socket"
import {
  decodeProtocolDataAndTransferToWasm,
  decodeSessionAndTransferToWasm,
  sendProtocolData,
  wasmGetProtocolData,
} from "../helpers/send-round-data"
import { wasmTriggerSign } from "../helpers/trigger-sign"
import { isEIP1559CompatibleTransaction } from "../helpers/tx-type-check"
import { type SendTransactionParams, type SendTransactionResult } from "./common"
import { toTransactionInServerFormat } from "./prepare-tx"
import { sendTransactionRequest } from "./send-tx-request"
import { serializeTX } from "./serialize-tx"
import { toTxHash } from "./to-tx-hash"

const _sendPaidTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const {
    waypointToken,
    clientShard,
    transaction,
    chain,

    wasmUrl,
    wsUrl,
  } = params
  const address = getAddressFromShard(clientShard)
  const txInServerFormat = await toTransactionInServerFormat({
    chain,
    transaction,
    currentAddress: address,
  })
  const serializedTx = serializeTX(txInServerFormat)
  const keccakSerializedTx = keccak256(serializedTx, "bytes")
  console.debug("🔏 SEND TX: start")

  const signHandler = await wasmGetSignHandler(wasmUrl)
  console.debug("🔏 SEND TX: wasm is ready")

  const socket = await openSocket(`${wsUrl}/v1/public/ws/send`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔏 SEND TX: socket is ready")

  try {
    sendAuthenticate(socket, waypointToken)
    const authFrame = await waitAndDequeue()
    const authData = decodeAuthenticateData(authFrame)
    console.debug("🔏 SEND TX: authenticated", authData.uuid)

    const signResultPromise = wasmTriggerSign(signHandler, keccakSerializedTx, clientShard)
    console.debug("🔏 SEND TX: trigger wasm sign")

    sendTransactionRequest(socket, txInServerFormat, chain)
    console.debug("🔏 SEND TX: trigger socket sign")

    const sessionFrame = await waitAndDequeue()
    decodeSessionAndTransferToWasm(signHandler, sessionFrame)

    const socketR1 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR1)
    console.debug("🔏 SEND TX: socket - round 1")

    const wasmR1 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR1)
    console.debug("🔏 SEND TX: wasm - round 1")

    const socketR2 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR2)
    console.debug("🔏 SEND TX: socket - round 2")

    const wasmR2 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR2)
    console.debug("🔏 SEND TX: wasm - round 2")

    const socketR3 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR3)
    console.debug("🔏 SEND TX: socket - round 3")

    const sessionR2Frame = await waitAndDequeue()
    decodeSessionAndTransferToWasm(signHandler, sessionR2Frame)

    const socketR4 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR4)
    console.debug("🔏 SEND TX: socket - round 4")

    const wasmR3 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR3)
    console.debug("🔏 SEND TX: wasm - round 3")

    const socketR5 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR5)
    console.debug("🔏 SEND TX: socket - round 5")

    const sendTransactionResponseFrame = await waitAndDequeue()
    const txHash = toTxHash(sendTransactionResponseFrame)

    const doneFrame = await waitAndDequeue()
    if (doneFrame.type !== Type.DONE) throw decodeServerError(doneFrame)

    const signature = await signResultPromise
    console.debug("🔏 SEND TX: done")
    return {
      txHash: txHash,
      signature,
    }
  } finally {
    socket.close()
  }
}

export const sendPaidTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { chain, transaction, wasmUrl, waypointToken, wsUrl } = params
  const tracker = createTracker({
    event: isEIP1559CompatibleTransaction(transaction.type)
      ? HeadlessEventName.endEIP1559Transaction
      : HeadlessEventName.sendLegacyTransaction,
    waypointToken,
    productionFactor: wsUrl,
    wasmUrl,
  })

  try {
    const result = await _sendPaidTransaction(params)
    const { txHash } = result
    tracker.trackOk({
      request: { transaction, chain },
      response: { txHash },
    })

    return result
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
