/* eslint-disable simple-import-sort/exports */

// headless core
export { HeadlessCore, type CreateHeadlessCoreOpts } from "./client/core"

// actions
export { getAddressFromShard } from "./action/get-address"
export { decryptShard, type DecryptShardParams } from "./action/decrypt-shard"
export { encryptShard, type EncryptShardParams } from "./action/encrypt-shard"
export { backupShard, type BackupShardParams } from "./action/backup-shard"
export { keygen, type KeygenParams } from "./action/keygen"

export { personalSign, type PersonalSignParams } from "./action/personal-sign"
export { signTypedData, type SignTypedDataParams } from "./action/sign-typed-data"

export { sendPaidTransaction } from "./action/send-transaction/send-paid-tx"
export { sendSponsoredTransaction } from "./action/send-transaction/send-sponsored"
export {
  SupportedTransaction,
  UnsupportedTransaction,
  type SupportedTransactionType,
  type UnsupportedTransactionType,
  type ChainParams,
  type TransactionParams,
  type TransactionType,
} from "../common/transaction/common"

export {
  type SendTransactionParams,
  type SendTransactionResult,
} from "./action/send-transaction/types"

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
} from "./action/helpers/validate-sponsor-tx"

// error
export {
  HeadlessClientError,
  HeadlessClientErrorCode,
  type HeadlessClientErrorType,
} from "./error/client"
export { ServerError, ServerErrorCode, type ServerErrorType } from "./error/server"

// utils
export { validateToken } from "../common/utils/token"
export { WASM_URL } from "./wasm/cdn"
