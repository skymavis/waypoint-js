/* eslint-disable simple-import-sort/exports */

// client
export {
  HeadlessClient,
  type ConnectParam,
  type CreateHeadlessClientOpts,
  type ReconnectParams,
  type ValidateSponsorTxParams,
} from "./client/headless-client"

// actions
export { getAddressFromShard } from "./action/get-address"
export { decryptShard, type DecryptShardParams } from "./action/decrypt-shard"
export { encryptShard, type EncryptShardParams } from "./action/encrypt-shard"
export { backupShard, type BackupShardParams } from "./action/backup-shard"
export { keygen, type KeygenParams } from "./action/keygen"

export { personalSign, type PersonalSignParams } from "./action/personal-sign"
export { signTypedData, type SignTypedDataParams } from "./action/sign-typed-data"

export { sendLegacyTransaction } from "./action/send-transaction/send-legacy"
export { sendSponsoredTransaction } from "./action/send-transaction/send-sponsored"
export {
  LEGACY_TYPE,
  RONIN_GAS_SPONSOR_TYPE,
  type ChainParams,
  type SendTransactionParams,
  type SendTransactionResult,
  type TransactionParams,
} from "./action/send-transaction/common"

// error
export {
  HeadlessClientError,
  HeadlessClientErrorCode,
  type HeadlessClientErrorType,
} from "./error/client"
export { ServerError, type ServerErrorType } from "./error/server"

// storage
export { DEFAULT_SHARD_STORAGE_KEY, type ClientShardStorage } from "./client/shard-storage"
