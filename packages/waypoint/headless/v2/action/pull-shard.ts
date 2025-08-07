import { isPasswordlessProd } from "../../common"
import { ServerError } from "../../common/error/server"
import { request } from "../../common/request/request"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { arrayBufferToBase64 } from "../../common/utils/convertor"
import { RawServerError } from "../error/raw-server"
import { BaseParams } from "./types"

export type PullShardParams = BaseParams & {
  clientEncryptedKey: ArrayBuffer
}

export type PullShardApiResponse = {
  shardCiphertextB64: string
  shardEncryptedKeyB64: string
  shardNonceB64: string
}

export const pullShard = async (params: PullShardParams) => {
  const { httpUrl, waypointToken, clientEncryptedKey } = params

  const tracker = createTracker({
    event: HeadlessEventName.pullPasswordlessClientShard,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isPasswordlessProd(httpUrl),
  })
  const { data, error } = await request<PullShardApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/pull-shard`,
    {
      headers: { authorization: waypointToken },
      body: {
        client_encrypted_key: arrayBufferToBase64(clientEncryptedKey),
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
