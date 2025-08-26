import {
  Hex,
  hexToBigInt,
  hexToNumber,
  serializeTransaction,
  TransactionSerializableEIP1559,
  TransactionSerializableLegacy,
} from "viem"

import { TransactionInServerFormat } from "./common"
import { isEIP1559CompatibleTransaction } from "./tx-type-check"

const createBaseTransaction = (tx: TransactionInServerFormat) => ({
  to: tx.to,
  data: tx.input,
  value: hexToBigInt(tx.value),
  gas: hexToBigInt(tx.gas),
  nonce: hexToNumber(tx.nonce),
  chainId: hexToNumber(tx.chainId),
})

const createEIP1559CompatibleTransaction = (
  tx: TransactionInServerFormat,
): TransactionSerializableEIP1559<bigint, number> => ({
  ...createBaseTransaction(tx),
  type: "eip1559",
  maxFeePerGas: hexToBigInt(tx.maxFeePerGas),
  maxPriorityFeePerGas: hexToBigInt(tx.maxPriorityFeePerGas),
})

const createLegacyTransaction = (
  tx: TransactionInServerFormat,
): TransactionSerializableLegacy<bigint, number> => ({
  ...createBaseTransaction(tx),
  type: "legacy",
  gasPrice: hexToBigInt(tx.gasPrice),
})

export const serializeTX = (tx: TransactionInServerFormat): Hex => {
  const serializableTx = isEIP1559CompatibleTransaction(tx.type)
    ? createEIP1559CompatibleTransaction(tx)
    : createLegacyTransaction(tx)

  return serializeTransaction(serializableTx)
}
