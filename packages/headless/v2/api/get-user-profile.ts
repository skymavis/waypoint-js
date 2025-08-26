import { Address } from "viem"

import { PreferMethod, ServerError } from "../../common"
import { request } from "../../common/request/request"
import { BaseParams, RawServerError } from "../types"

export type GetUserProfileApiResponse = {
  uuid: string
  address: Address
  has_support_passwordless: boolean
  prefer_method: PreferMethod
}

export const getUserProfileApi = async (params: BaseParams) => {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GetUserProfileApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/get-user-profile`,
    {
      headers: { authorization: waypointToken },
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
