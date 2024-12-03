import { create, fromBinary, toBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { toServerError } from "../../error/server"
import { Frame, FrameSchema, SessionSchema, Type } from "../../proto/rpc"
import { base64ToBytes, bytesToBase64, bytesToJson, jsonToBytes } from "../../utils/convertor"
import { type ActionHandler, HandlerRxResult, HandlerTxParams } from "../../wasm/types"

export const wasmGetProtocolData = async (signHandler: ActionHandler) => {
  try {
    const wasmResultInBytes = await signHandler.rx()
    const wasmResult = bytesToJson(wasmResultInBytes) as HandlerRxResult
    const { kind, data } = wasmResult ?? {}

    if (kind === "mpc_protocol" && data) {
      return data
    }

    throw "Protocol data received from wasm is not valid."
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmGetProtocolResultError,
      message: `Unable to receive the round data from WASM process.`,
    })
  }
}

export const wasmReceiveProtocolData = (signHandler: ActionHandler, frame: Frame) => {
  try {
    if (frame.type === Type.DATA) {
      const txParams: HandlerTxParams = {
        kind: "mpc_protocol",
        data: bytesToBase64(frame.data),
      }
      signHandler.tx(jsonToBytes(txParams))

      return
    }

    throw toServerError(frame)
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmReceiveSocketDataError,
      message: `Unable to transfer the protocol data from the socket to WASM.`,
    })
  }
}

export const wasmReceiveSession = (signHandler: ActionHandler, frame: Frame) => {
  try {
    if (frame.type === Type.DATA) {
      const session = fromBinary(SessionSchema, frame.data)

      const txParams: HandlerTxParams = {
        kind: "mpc_protocol",
        data: {
          sessionID: session.sessionId,
        },
      }
      signHandler.tx(jsonToBytes(txParams))

      return
    }

    throw toServerError(frame)
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmReceiveSocketDataError,
      message: `Unable to transfer the session data from the socket to WASM.`,
    })
  }
}

export const sendProtocolData = (socket: WebSocket, base64Data: string) => {
  try {
    const requestInFrame = create(FrameSchema, {
      type: Type.DATA,
      data: base64ToBytes(base64Data),
      id: 3,
    })
    const requestInBuffer = toBinary(FrameSchema, requestInFrame)

    socket.send(requestInBuffer)
    return
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.SocketSendError,
      message: `Unable to send the WASM round data to socket.`,
    })
  }
}
