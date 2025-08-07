import { isPasswordlessProd, ServerError } from "../../common"
import { request } from "../../common/request/request"
import { createTracker, HeadlessEventName } from "../../common/track/track"
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

export const migrateShard = async (params: MigrateShardParams) => {
  const { httpUrl, waypointToken, shardCiphertextB64, shardEncryptedKeyB64, shardNonceB64 } = params

  const tracker = createTracker({
    event: HeadlessEventName.migrateFromPasswordWallet,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isPasswordlessProd(httpUrl),
  })
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
    //No track response or request, only track event
    tracker.trackOk({})
    return data
  }

  tracker.trackError(error)
  throw new ServerError({ code: error.error_code, message: error.error_message })
}
