import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "./helpers/request/abort-key"
import { request } from "./helpers/request/request"

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
      key: AbortKey.getBackupClientShard,
    },
  )

  if (data) {
    return data.data
  }

  throw new ServerError({ code: error.code, message: error.errorMessage })
}
