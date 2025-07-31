import { Hex } from "viem"

import { request } from "../../headless-common-helper/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { BaseParams } from "./types"

export type SignParams = BaseParams & {
  messageBase64: string
}

export type SignApiResponse = {
  signature: Hex
}

export const sign = async (params: SignParams) => {
  const { httpUrl, waypointToken, messageBase64 } = params

  const { data, error } = await request<SignApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/sign`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.sign,
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
