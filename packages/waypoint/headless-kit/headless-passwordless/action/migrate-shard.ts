import { request } from "../../headless-common-helper/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../track/track"
import { BaseParams } from "./types"

export type MigrateShardParams = BaseParams & {
  shardCiphertextB64: string
  shardEncryptedKeyB64: string
  shardNonceB64: string
}

export type MigrateShardResult = {
  uuid: string
}

export type MigrateShardApiResponse = {
  data: MigrateShardResult
}

export async function migrateShard(params: MigrateShardParams) {
  const { httpUrl, waypointToken, shardCiphertextB64, shardEncryptedKeyB64, shardNonceB64 } = params

  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.migrateFromPasswordWallet,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    productionFactor: httpUrl,
  })
  const { data, error } = await request<MigrateShardApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/migrate-shard`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.migrateFromPasswordWallet,
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
    return data.data
  }

  tracker.trackError(error)
  throw new ServerError({ code: error.error_code, message: error.error_message })
}
