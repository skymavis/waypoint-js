import { create, toBinary } from "@bufbuild/protobuf"
import { type Hex, keccak256 } from "viem"

import { FrameSchema, Type } from "../proto/rpc"
import { SignRequestSchema, SignType } from "../proto/sign"
import { hexToBase64, jsonToBytes } from "../utils/convertor"
import { toEthereumSignature } from "../utils/signature"
import { decodeAuthenticateData, sendAuthenticate } from "./helpers/authenticate"
import { wasmGetSignHandler } from "./helpers/get-sign-handler"
import { createFrameQueue, openSocket } from "./helpers/open-socket"
import {
  decodeProtocolDataAndTransferToWasm,
  decodeSessionAndTransferToWasm,
  sendProtocolData,
  wasmGetProtocolData,
} from "./helpers/send-round-data"
import { wasmTriggerSign } from "./helpers/trigger-sign"

const sendSignMessageRequest = (socket: WebSocket, rawMessage: Hex) => {
  const signRequest = create(SignRequestSchema, {
    params: jsonToBytes(hexToBase64(rawMessage)),
    type: SignType.MESSAGE,
  })
  const frame = create(FrameSchema, {
    type: Type.DATA,
    data: toBinary(SignRequestSchema, signRequest),
  })

  socket.send(toBinary(FrameSchema, frame))
}

type SignParams = {
  rawMessage: Hex

  waypointToken: string
  clientShard: string

  wasmUrl: string
  wsUrl: string
}

export const _sign = async (params: SignParams): Promise<Hex> => {
  const {
    waypointToken,
    clientShard,
    rawMessage,

    wasmUrl,
    wsUrl,
  } = params
  const keccakMessage = keccak256(rawMessage, "bytes")
  console.debug("🔏 SIGN: start")

  const signHandler = await wasmGetSignHandler(wasmUrl)
  console.debug("🔏 SIGN: wasm is ready")

  const socket = await openSocket(`${wsUrl}/v1/public/ws/sign-v2`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔏 SIGN: socket is ready")

  try {
    sendAuthenticate(socket, waypointToken)
    const authFrame = await waitAndDequeue()
    const authData = decodeAuthenticateData(authFrame)
    console.debug("🔏 SIGN: authenticated", authData.uuid)

    const signResultPromise = wasmTriggerSign(signHandler, keccakMessage, clientShard)
    console.debug("🔏 SIGN: trigger wasm sign")

    sendSignMessageRequest(socket, rawMessage)
    console.debug("🔏 SIGN: trigger socket sign")

    const sessionFrame = await waitAndDequeue()
    decodeSessionAndTransferToWasm(signHandler, sessionFrame)

    const socketR1 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR1)
    console.debug("🔏 SIGN: socket - round 1")

    const wasmR1 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR1)
    console.debug("🔏 SIGN: wasm - round 1")

    const socketR2 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR2)
    console.debug("🔏 SIGN: socket - round 2")

    const wasmR2 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR2)
    console.debug("🔏 SIGN: wasm - round 2")

    const socketR3 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR3)
    console.debug("🔏 SIGN: socket - round 3")

    const sessionR2Frame = await waitAndDequeue()
    decodeSessionAndTransferToWasm(signHandler, sessionR2Frame)

    const socketR4 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR4)
    console.debug("🔏 SIGN: socket - round 4")

    const wasmR3 = await wasmGetProtocolData(signHandler)
    sendProtocolData(socket, wasmR3)
    console.debug("🔏 SIGN: wasm - round 3")

    const socketR5 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(signHandler, socketR5)
    console.debug("🔏 SIGN: socket - round 5")

    const signature = await signResultPromise
    console.debug("🔏 SIGN: done")

    return toEthereumSignature(signature)
  } finally {
    socket.close()
  }
}
