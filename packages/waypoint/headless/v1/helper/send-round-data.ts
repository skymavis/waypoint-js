import { create, fromBinary, toBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import {
  base64ToBytes,
  bytesToBase64,
  bytesToJson,
  jsonToBytes,
} from "../../common/utils/convertor"
import { decodeServerError } from "../error/server"
import { Frame, FrameSchema, SessionSchema, Type } from "../proto/rpc"
import { type ActionHandler, HandlerRxResult, HandlerTxParams } from "../wasm/types"

export const wasmGetProtocolData = async (signHandler: ActionHandler) => {
  try {
    const wasmResultInBytes = await signHandler.rx()
    const wasmResult = bytesToJson(wasmResultInBytes) as HandlerRxResult
    const { kind, data } = wasmResult ?? {}

    if (kind === "mpc_protocol" && data) {
      return data
    }

    throw "Protocol data received from WASM is not valid."
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmGetProtocolResultError,
      message: `Unable to receive the protocol round data from WASM process.`,
    })
  }
}

export const decodeProtocolDataAndTransferToWasm = (signHandler: ActionHandler, frame: Frame) => {
  if (frame.type !== Type.DATA) throw decodeServerError(frame)

  try {
    const txParams: HandlerTxParams = {
      kind: "mpc_protocol",
      data: bytesToBase64(frame.data),
    }
    signHandler.tx(jsonToBytes(txParams))

    return
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmReceiveSocketDataError,
      message: `Unable to transfer the protocol data from the socket to WASM.`,
    })
  }
}

export const decodeSessionAndTransferToWasm = (signHandler: ActionHandler, frame: Frame) => {
  if (frame.type !== Type.DATA) throw decodeServerError(frame)

  try {
    const session = fromBinary(SessionSchema, frame.data)
    const txParams: HandlerTxParams = {
      kind: "mpc_protocol",
      data: {
        sessionID: session.sessionId,
      },
    }
    signHandler.tx(jsonToBytes(txParams))

    return
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmReceiveSocketDataError,
      message: `Unable to transfer the session data from the socket to WASM.`,
    })
  }
}

export const sendProtocolData = (socket: WebSocket, base64Data: string) => {
  const frame = create(FrameSchema, {
    type: Type.DATA,
    data: base64ToBytes(base64Data),
  })

  socket.send(toBinary(FrameSchema, frame))
}
