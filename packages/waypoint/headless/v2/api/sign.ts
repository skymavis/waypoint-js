import { Hex } from "viem"

import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"
import { BaseParams } from "./types"

export type SignParams = BaseParams & {
  messageBase64: string
}

export type SignApiResponse = {
  signature: Hex
}

export const signApi = async (params: SignParams) => {
  const { httpUrl, waypointToken, messageBase64 } = params

  const { data, error } = await request<SignApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/sign`,
    {
      headers: { authorization: waypointToken },
      body: {
        message_base64: messageBase64,
      },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
