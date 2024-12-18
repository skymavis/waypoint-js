/* eslint-disable simple-import-sort/exports */

// simple client
export { HeadlessClient, type CreateHeadlessClientOpts } from "./client/client"

// headless core
export { HeadlessCore, type CreateHeadlessCoreOpts } from "./client/core"
export {
  HeadlessProvider,
  type HeadlessProviderSchema,
  type HeadlessProviderType,
} from "./client/provider"

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

// utils
export { validateToken } from "./utils/token"
export { WASM_URL } from "./wasm/cdn"
