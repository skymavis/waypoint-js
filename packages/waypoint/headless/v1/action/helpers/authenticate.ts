import { create, fromBinary, toBinary } from "@bufbuild/protobuf"
import { v4 as uuidv4 } from "uuid"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../../common/error/client"
import { addBearerPrefix } from "../../../common/utils/token"
import { decodeServerError } from "../../error/server"
import { AuthenticateRequestSchema, AuthenticateResponseSchema } from "../../proto/auth"
import { Frame, FrameSchema, Type } from "../../proto/rpc"

export const sendAuthenticate = (socket: WebSocket, waypointToken: string) => {
  const authRequest = create(AuthenticateRequestSchema, {
    token: addBearerPrefix(waypointToken),
    optionalData: {
      requestId: uuidv4(),
    },
  })
  const frame = create(FrameSchema, {
    data: toBinary(AuthenticateRequestSchema, authRequest),
    type: Type.DATA,
  })

  socket.send(toBinary(FrameSchema, frame))
}

export const decodeAuthenticateData = (authFrame: Frame) => {
  if (authFrame.type !== Type.DATA) throw decodeServerError(authFrame)

  try {
    const authResponse = fromBinary(AuthenticateResponseSchema, authFrame.data)

    return authResponse
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.AuthenticateError,
      message: `Unable to decode frame data received from the server. The data should be in a authenticate response schema.`,
      cause: error,
    })
  }
}
