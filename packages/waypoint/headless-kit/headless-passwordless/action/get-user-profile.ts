import { Address } from "viem"

import { PreferMethod } from "../../headless-adapter"
import { request } from "../../headless-common-helper/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { BaseParams } from "./types"

export type GetUserProfileParams = BaseParams

export type GetUserProfileApiResponse = {
  uuid: string
  address: Address
  has_support_passwordless: boolean
  prefer_method: PreferMethod
}

export const getUserProfile = async (params: GetUserProfileParams) => {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GetUserProfileApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/get-user-profile`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.getUserProfile,
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({
    code: error.error_code,
    message: error.error_message,
  })
}
