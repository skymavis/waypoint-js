import { create, fromBinary, toBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { toServerError } from "../../error/server"
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
  const frame = create(FrameSchema, {
    data: toBinary(AuthenticateRequestSchema, authRequest),
    type: Type.DATA,
  })

  socket.send(toBinary(FrameSchema, frame))
}

export const toAuthenticateData = (authFrame: Frame) => {
  try {
    if (authFrame.type === Type.DATA) {
      const authResponse = fromBinary(AuthenticateResponseSchema, authFrame.data)

      return authResponse
    }

    throw toServerError(authFrame)
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SocketAuthenticateError,
      message: `Unable to authenticate the user with the server.`,
      cause: error,
    })
  }
}
