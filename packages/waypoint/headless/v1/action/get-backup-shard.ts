import { ServerError } from "../../common/error/server"
import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"

type GetBackupKeyApiResponse = {
  data: GetBackupClientShardResult
}

export type GetBackupClientShardParams = {
  httpUrl: string
  waypointToken: string
}
export type GetBackupClientShardResult = {
  key: string
  updatedAt: string
}

export const getBackupClientShard = async (params: GetBackupClientShardParams) => {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GetBackupKeyApiResponse, RawServerError>(
    `get ${httpUrl}/v1/public/backup/keys`,
    {
      headers: { authorization: waypointToken },
    },
  )

  if (data) {
    return data.data
  }

  throw new ServerError({ code: error.code, message: error.errorMessage })
}
