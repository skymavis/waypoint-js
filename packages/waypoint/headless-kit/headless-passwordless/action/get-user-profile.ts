import { Address } from "viem"

import { request } from "../../headless-common-helper/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { BaseParams } from "./types"

export enum PreferMethod {
  Passwordless = "passwordless",
  RecoveryPassword = "recovery_password",
}

export type GetUserProfileParams = BaseParams

export type GetUserProfileResult = {
  uuid: string
  address: Address
  has_support_passwordless: boolean
  prefer_method: PreferMethod
}

export type GetUserProfileApiResponse = {
  data: GetUserProfileResult
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
    return data.data
  }

  throw new ServerError({
    code: error.error_code,
    message: error.error_message,
  })
}
