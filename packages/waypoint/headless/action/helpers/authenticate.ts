import { create, fromBinary, toBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { toSocketError } from "../../error/socket"
import { AuthenticateRequestSchema, AuthenticateResponseSchema } from "../../proto/auth"
import { Frame, FrameSchema, Type } from "../../proto/rpc"
import { addBearerPrefix } from "../../utils/validate-param"

export const sendAuthenticate = (socket: WebSocket, waypointToken: string) => {
  const authRequest = create(AuthenticateRequestSchema, {
    token: addBearerPrefix(waypointToken),
    optionalData: {
      requestId: crypto.randomUUID(),
    },
  })
  const requestInFrame = create(FrameSchema, {
    // * id field has no effect on the server side
    // * should be incremented for each request
    id: 0,
    data: toBinary(AuthenticateRequestSchema, authRequest),
    type: Type.DATA,
  })
  const requestInBuffer = toBinary(FrameSchema, requestInFrame)

  socket.send(requestInBuffer)
}

export const toAuthenticateData = (authFrame: Frame) => {
  const createError = (cause: unknown) => {
    return new HeadlessClientError({
      code: HeadlessClientErrorCode.SocketAuthenticateError,
      message: `Unable to authenticate the user with the server.`,
      cause,
    })
  }

  try {
    if (authFrame.type === Type.DATA) {
      const authResponse = fromBinary(AuthenticateResponseSchema, authFrame.data)

      return authResponse
    }

    throw createError(toSocketError(authFrame))
  } catch (error) {
    throw createError(error)
  }
}
