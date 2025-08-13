import { ServerError } from "../../common/error/server"
import { request } from "../../common/request/request"
import { BaseParams, RawServerError } from "../types"

export type PullShardParams = BaseParams & {
  clientEncryptedKey: string
}

export type PullShardApiResponse = {
  shardCiphertextB64: string
  shardEncryptedKeyB64: string
  shardNonceB64: string
}

export const pullShardApi = async (params: PullShardParams) => {
  const { httpUrl, waypointToken, clientEncryptedKey } = params

  const { data, error } = await request<PullShardApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/pull-shard`,
    {
      headers: { authorization: waypointToken },
      body: {
        client_encrypted_key: clientEncryptedKey,
      },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
