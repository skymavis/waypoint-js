import { Hex } from "viem"

import { ChainParams, TransactionParams } from "../../../common/transaction/common"

export type SendTransactionParams = {
  waypointToken: string
  clientShard: string

  chain: ChainParams
  transaction: TransactionParams

  wasmUrl: string
  wsUrl: string
}

export type SendTransactionResult = {
  txHash: Hex
  signature: Hex
}
