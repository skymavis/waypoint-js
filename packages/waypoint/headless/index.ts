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

export { keygen } from "./action/keygen"

export { getAddressFromShard } from "./action/get-address"
export { decryptShard } from "./action/decrypt-shard"
export { encryptShard } from "./action/encrypt-shard"

export { personalSign } from "./action/personal-sign"
export { sendTransaction } from "./action/send-tx"
export { sendSponsoredTransaction } from "./action/send-sponsored-tx"
