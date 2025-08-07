import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { migrateShardApi } from "../api/migrate-shard"
import { BaseParams } from "../api/types"
import { AESEncrypt } from "./helpers/crypto-actions"

export type MigrateShardActionParams = BaseParams & {
  clientShard: string
  exchangePublicKey: string
}

export const migrateShardAction = async (params: MigrateShardActionParams) => {
  const { httpUrl, waypointToken, clientShard, exchangePublicKey } = params

  const tracker = createTracker({
    event: HeadlessEventName.migrateFromPasswordWallet,
    waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isHeadlessV2Prod(httpUrl),
  })

  try {
    const encryptedShardPayload = await AESEncrypt({
      content: clientShard,
      key: exchangePublicKey,
    })

    const data = await migrateShardApi({
      httpUrl,
      waypointToken,
      shardCiphertextB64: encryptedShardPayload.ciphertextB64,
      shardEncryptedKeyB64: encryptedShardPayload.encryptedKeyB64,
      shardNonceB64: encryptedShardPayload.nonceB64,
    })

    tracker.trackOk({
      response: { ...data },
    })

    return data
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
