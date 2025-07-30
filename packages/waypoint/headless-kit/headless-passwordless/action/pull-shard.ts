import { request } from "../../headless-common-helper/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../track/track"
import { BaseParams } from "./types"

export type PullShardParams = BaseParams & {
  clientEncryptedKey: string
}

export type PullShardResult = {
  shardCiphertextB64: string
  shardEncryptedKeyB64: string
  shardNonceB64: string
}

export type PullShardApiResponse = {
  data: PullShardResult
}

export async function pullShard(params: PullShardParams) {
  const { httpUrl, waypointToken, clientEncryptedKey } = params

  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.pullPasswordlessClientShard,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    productionFactor: httpUrl,
  })
  const { data, error } = await request<PullShardApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/pull-shard`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.pullPasswordlessShard,
      body: {
        client_encrypted_key: clientEncryptedKey,
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
