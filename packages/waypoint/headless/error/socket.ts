import { fromBinary } from "@bufbuild/protobuf"

import { ErrorSchema, Frame, Type } from "../proto/rpc"

type SocketErrorOpts = {
  code: number
  message: string
}

export type SocketErrorType = SocketError & {
  name: "SocketError"
}

export class SocketError extends Error {
  override name = "SocketError"
  code: number

  constructor({ code, message }: SocketErrorOpts) {
    super(message)

    this.code = code
  }
}

export const toSocketError = (frame: Frame) => {
  if (frame.type === Type.ERROR) {
    const error = fromBinary(ErrorSchema, frame.data)

    return new SocketError({ code: Number(error.code), message: error.message })
  }

  if (frame.type === Type.UNSPECIFIED) {
    return new SocketError({
      code: -1,
      message: "unspecified server response",
    })
  }

  return undefined
}
