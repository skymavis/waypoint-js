import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"
import { BaseParams } from "./types"

export type MigrateShardParams = BaseParams & {
  shardCiphertextB64: string
  shardEncryptedKeyB64: string
  shardNonceB64: string
}

export type MigrateShardApiResponse = {
  uuid: string
}

export const migrateShardApi = async (params: MigrateShardParams) => {
  const { httpUrl, waypointToken, shardCiphertextB64, shardEncryptedKeyB64, shardNonceB64 } = params

  const { data, error } = await request<MigrateShardApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/migrate-shard`,
    {
      headers: { authorization: waypointToken },
      body: {
        shard_ciphertext_b64: shardCiphertextB64,
        shard_encrypted_key_b64: shardEncryptedKeyB64,
        shard_nonce_b64: shardNonceB64,
      },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
