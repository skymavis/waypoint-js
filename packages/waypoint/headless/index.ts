/* eslint-disable simple-import-sort/exports */

// simple client
export {
  HeadlessClient,
  type ConnectParam,
  type CreateHeadlessClientOpts,
  type ReconnectParams,
  type ValidateSponsorTxParams,
} from "./client/headless-client"

// base client
export { BaseClient, type CreateBaseClientOpts } from "./client/base-client"
export {
  BaseProvider,
  type BaseProviderSchema,
  type BaseProviderType,
} from "./client/base-provider"

// storage
export { DEFAULT_SHARD_STORAGE_KEY, type ClientShardStorage } from "./client/shard-storage"

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

export {
  getBackupClientShard,
  type GetBackupClientShardParams,
  type GetBackupClientShardResult,
} from "./action/get-backup-shard"
export {
  getUserProfile,
  type GetUserProfileParams,
  type GetUserProfileResult,
} from "./action/get-user-profile"
export {
  validateSponsorTransaction,
  type ValidateSponsorTransactionParams,
  type ValidateSponsorTransactionResult,
} from "./action/validate-sponsor-tx"

// error
export {
  HeadlessClientError,
  HeadlessClientErrorCode,
  type HeadlessClientErrorType,
} from "./error/client"
export { ServerError, type ServerErrorType } from "./error/server"
