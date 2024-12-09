import { fromBinary } from "@bufbuild/protobuf"

import { ErrorSchema, Frame, Type } from "../proto/rpc"
import { HeadlessClientError, HeadlessClientErrorCode } from "./client"

type ServerErrorOpts = {
  code: number
  message: string
}

export type ServerErrorType = ServerError & {
  name: "ServerError"
}

export class ServerError extends Error {
  override name = "MpcServerError"
  code: number
  shortMessage: string

  constructor({ code, message }: ServerErrorOpts) {
    const fullMessage = ["", `code: ${code}`, `message: ${message}`].join("\n• ")

    super(fullMessage)

    this.code = code
    this.shortMessage = message
  }
}

export const toServerError = (frame: Frame) => {
  if (frame.type === Type.ERROR) {
    const error = fromBinary(ErrorSchema, frame.data)

    return new ServerError({ code: Number(error.code), message: error.message })
  }

  if (frame.type === Type.UNSPECIFIED) {
    return new ServerError({
      code: -1,
      message: "unspecified server response",
    })
  }

  return new HeadlessClientError({
    cause: undefined,
    code: HeadlessClientErrorCode.MissingMessageError,
    message:
      "The client has not processed the message from socket. This is most likely the SDK bug, please upgrade to the latest version.",
  })
}
