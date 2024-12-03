/* eslint-disable simple-import-sort/exports */
export {
  HeadlessClient,
  type ConnectParam,
  type CreateHeadlessClientOpts,
  type ReconnectParams,
  type ValidateSponsorTxParams,
} from "./client/headless-client"

export {
  HeadlessClientError,
  type HeadlessClientErrorCode,
  type HeadlessClientErrorType,
} from "./error/client"

export { DEFAULT_SHARD_STORAGE_KEY, type ClientShardStorage } from "./client/shard-storage"
export { RONIN_GAS_SPONSOR_TYPE } from "./common/tx"

// actions
export { getAddressFromShard } from "./action/get-address"
export { decryptShard, type DecryptShardParams } from "./action/decrypt-shard"
export { encryptShard, type EncryptShardParams } from "./action/encrypt-shard"
export { backupShard, type BackupShardParams } from "./action/backup-shard"

export { keygen, type KeygenParams } from "./action/keygen"
export { personalSign, type PersonalSignParams } from "./action/personal-sign"
export { sendTransaction } from "./action/send-tx"
export { sendSponsoredTransaction } from "./action/send-sponsored-tx"
