import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { arrayBufferToBase64 } from "../../common/utils/convertor"
import { pullShardApi } from "../api/pull-shard"
import { BaseParams } from "../api/types"
import { AESDecrypt } from "./helpers/crypto-actions"
import { encryptContent } from "./helpers/key-actions"

export type PullShardActionParams = BaseParams & {
  exchangePublicKey: string
}

export async function pullShardAction(params: PullShardActionParams) {
  const { httpUrl, waypointToken, exchangePublicKey } = params

  const tracker = createTracker({
    event: HeadlessEventName.pullPasswordlessClientShard,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isHeadlessV2Prod(httpUrl),
  })

  try {
    const { encryptedContent: clientEncryptedKey, encryptionKey } =
      await encryptContent(exchangePublicKey)

    const pullShardResult = await pullShardApi({
      httpUrl,
      waypointToken,
      clientEncryptedKey: arrayBufferToBase64(clientEncryptedKey),
    })

    tracker.trackOk({
      response: { ...pullShardResult },
    })

    return AESDecrypt({
      ciphertextB64: pullShardResult.shardCiphertextB64,
      nonceB64: pullShardResult.shardNonceB64,
      aesKey: encryptionKey,
    })
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
