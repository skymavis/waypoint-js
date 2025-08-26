import { fromBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { ServerError, ServerErrorCode } from "../../common/error/server"
import { ErrorSchema, Frame, Type } from "../proto/rpc"

export const decodeServerError = (frame: Frame) => {
  if (frame.type === Type.ERROR) {
    const error = fromBinary(ErrorSchema, frame.data)

    return new ServerError({ code: Number(error.code), message: error.message })
  }

  if (frame.type === Type.UNSPECIFIED) {
    return new ServerError({
      code: ServerErrorCode.Unknown,
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
