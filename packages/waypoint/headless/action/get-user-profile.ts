import type { Address } from "viem"

import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "./helpers/request/abort-key"
import { request } from "./helpers/request/request"

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
      key: AbortKey.getUserProfile,
    },
  )

  if (data) {
    return data.data
  }

  throw new ServerError({ code: error.code, message: error.errorMessage })
}
