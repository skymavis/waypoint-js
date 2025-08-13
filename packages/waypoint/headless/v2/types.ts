import { Address, Hex } from "viem"

import { ChainParams, TransactionParams } from "../common/transaction/common"

export type RawServerError = {
  error_code: number
  error_details: {
    reason: string
    server_error_code: number
  } | null
  error_message: string
}

export type BaseParams = {
  httpUrl: string
  waypointToken: string
}

export type EncryptedPasswordParams = {
  ciphertextB64: string
  clientEncryptedKeyB64: string
  nonceB64: string
}

export type SendTransactionParams = BaseParams & {
  address: Address
  chain: ChainParams
  transaction: TransactionParams
}

export type SendTransactionResult = {
  txHash: Hex
}
