import { Hex } from "viem"

import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { BaseParams, RawServerError } from "../types"

export type SignMessageParams = BaseParams & {
  messageBase64: string
}

export type SignMessageApiResponse = {
  signature: Hex
}

export const signMessageApi = async (params: SignMessageParams) => {
  const { httpUrl, waypointToken, messageBase64 } = params

  const { data, error } = await request<SignMessageApiResponse, RawServerError>(
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
