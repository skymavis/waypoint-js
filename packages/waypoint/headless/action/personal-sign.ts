import { create, toBinary } from "@bufbuild/protobuf"
import { type Hex, type SignableMessage, toPrefixedMessage, verifyMessage } from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { FrameSchema, Type } from "../proto/rpc"
import { SignRequestSchema, SignType } from "../proto/sign"
import { hexToBase64, jsonToBytes } from "../utils/convertor"
import { getAddressFromShard } from "./get-address"
import { sendAuthenticate, toAuthenticateData } from "./helpers/authenticate"
import { wasmGetSignHandler } from "./helpers/get-sign-handler"
import { createFrameQueue, openSocket } from "./helpers/open-socket"
import {
  sendProtocolData,
  wasmGetProtocolData,
  wasmReceiveProtocolData,
  wasmReceiveSession,
} from "./helpers/send-round-data"
import { wasmTriggerSign } from "./helpers/trigger-sign"

const sendPersonalSign = (socket: WebSocket, prefixedMessage: Hex) => {
  const signRequest = create(SignRequestSchema, {
    params: jsonToBytes(hexToBase64(prefixedMessage)),
    type: SignType.MESSAGE,
  })
  const requestInFrame = create(FrameSchema, {
    id: 1,
    type: Type.DATA,
    data: toBinary(SignRequestSchema, signRequest),
  })
  const requestInBuffer = toBinary(FrameSchema, requestInFrame)

  socket.send(requestInBuffer)
}

export type PersonalSignParams = {
  message: SignableMessage

  waypointToken: string
  clientShard: string

  wasmUrl: string
  wsUrl: string
}

export const personalSign = async (params: PersonalSignParams): Promise<Hex> => {
  const {
    waypointToken,
    clientShard,
    message,

    wasmUrl,
    wsUrl,
  } = params
  const address = getAddressFromShard(clientShard)
  const prefixedMessage = toPrefixedMessage(message)
  console.debug("🔏 SIGN: start")

  const signHandler = await wasmGetSignHandler(wasmUrl)
  console.debug("🔏 SIGN: wasm is ready")

  const socket = await openSocket(`${wsUrl}/v1/public/ws/sign-v2`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔏 SIGN: socket is ready")

  sendAuthenticate(socket, waypointToken)
  const authFrame = await waitAndDequeue()
  const authData = toAuthenticateData(authFrame)
  console.debug("🔏 SIGN: authenticated", authData.uuid)

  const signResultPromise = wasmTriggerSign(signHandler, prefixedMessage, clientShard)
  console.debug("🔏 SIGN: trigger wasm sign")

  sendPersonalSign(socket, prefixedMessage)
  console.debug("🔏 SIGN: trigger socket sign")

  const sessionFrame = await waitAndDequeue()
  wasmReceiveSession(signHandler, sessionFrame)

  const socketR1 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR1)
  console.debug("🔏 SIGN: socket - round 1")

  const wasmR1 = await wasmGetProtocolData(signHandler)
  sendProtocolData(socket, wasmR1)
  console.debug("🔏 SIGN: wasm - round 1")

  const socketR2 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR2)
  console.debug("🔏 SIGN: socket - round 2")

  const wasmR2 = await wasmGetProtocolData(signHandler)
  sendProtocolData(socket, wasmR2)
  console.debug("🔏 SIGN: wasm - round 2")

  const socketR3 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR3)
  console.debug("🔏 SIGN: socket - round 3")

  const sessionR2Frame = await waitAndDequeue()
  wasmReceiveSession(signHandler, sessionR2Frame)

  const socketR4 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR4)
  console.debug("🔏 SIGN: socket - round 4")

  const wasmR3 = await wasmGetProtocolData(signHandler)
  sendProtocolData(socket, wasmR3)
  console.debug("🔏 SIGN: wasm - round 3")

  const socketR5 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR5)
  console.debug("🔏 SIGN: socket - round 5")

  const signature = await signResultPromise
  const isValid = await verifyMessage({
    address: address,
    message,
    signature,
  })

  if (!isValid) {
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.InvalidSignatureError,
      message: `The signed message is invalid for the given address "${address}".`,
    })
  }

  console.debug("🔏 SIGN: success")
  return signature
}
