import { Address, Hex } from "viem"

import { ChainParams, TransactionParams } from "../../../common/transaction/common"

export type SendTransactionParams = {
  waypointToken: string
  httpUrl: string
  address: Address
  chain: ChainParams
  transaction: TransactionParams
}

export type SendTransactionResult = {
  txHash: Hex
}
