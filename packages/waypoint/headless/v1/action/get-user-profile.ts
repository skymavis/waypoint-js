import type { Address } from "viem"

import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"

type GetCurrentUserProfileApiResponse = {
  data: GetUserProfileResult
}

export type GetUserProfileParams = {
  httpUrl: string
  waypointToken: string
}
export type GetUserProfileResult = {
  address: Address
  updatedAt: number
  uuid: string
}

export const getUserProfile = async (params: GetUserProfileParams) => {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GetCurrentUserProfileApiResponse, RawServerError>(
    `get ${httpUrl}/v1/public/profiles/me`,
    {
      headers: { authorization: waypointToken },
    },
  )

  if (data) {
    return data.data
  }

  throw new ServerError({ code: error.code, message: error.errorMessage })
}
