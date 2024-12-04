import {
  type Address,
  createPublicClient,
  getAddress,
  hexToBigInt,
  hexToNumber,
  http,
  numberToHex,
  serializeTransaction,
  type TransactionSerializableLegacy,
} from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import {
  type ChainParams,
  LEGACY_TYPE,
  PAYER_INFO,
  RONIN_GAS_PRICE,
  RONIN_GAS_SPONSOR_TYPE,
  type TransactionInServerFormat,
  type TransactionParams,
} from "./common"

type FormatTransactionParams = {
  transaction: TransactionParams
  chain: ChainParams
  currentAddress: Address
}
export const toTransactionInServerFormat = async (params: FormatTransactionParams) => {
  const {
    chain: { chainId, rpcUrl },
    currentAddress,
    transaction,
  } = params
  const {
    type = LEGACY_TYPE,
    from = currentAddress,
    to,
    value = "0x",
    data = "0x",
    input,
    gasPrice = RONIN_GAS_PRICE,
    // * need rpc call to fill
    gas,
    nonce,
  } = transaction

  if (type !== LEGACY_TYPE && type !== RONIN_GAS_SPONSOR_TYPE) {
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
      message: `The transaction with type="${type}" is not supported. Please switch to legacy transaction with type="0x0" or sponsored transaction with type="0x64".`,
    })
  }

  if (!to) {
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
      message: `The transaction with to="${to}" (deploying new contracts) is not supported.`,
    })
  }

  try {
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    })

    const filledNonce = nonce
      ? hexToNumber(nonce)
      : await publicClient.getTransactionCount({ address: currentAddress, blockTag: "pending" })

    const filledGas = gas
      ? hexToBigInt(gas)
      : await publicClient.estimateGas({
          nonce: filledNonce,
          type: "legacy",
          to: getAddress(to),
          gasPrice: hexToBigInt(gasPrice),
          value: hexToBigInt(value),
          data: input ?? data,
        })

    const formattedTransaction: TransactionInServerFormat = {
      type,
      from,
      to,
      value,
      input: input ?? data,
      gasPrice,

      gas: numberToHex(filledGas),
      nonce: numberToHex(filledNonce),

      chainId: numberToHex(chainId),
      // placeholder fields
      r: "0x0",
      v: "0x0",
      s: "0x0",
      payerS: PAYER_INFO.s,
      payerR: PAYER_INFO.r,
      payerV: PAYER_INFO.v,
      maxFeePerGas: RONIN_GAS_PRICE,
      maxPriorityFeePerGas: RONIN_GAS_PRICE,
      expiredTime: "0x5208",
    }

    return formattedTransaction
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: `Unable to get additional transaction information (nonce, gasLimit,...). This could be due to a slow network or an RPC status.`,
    })
  }
}

export const serializeLegacyTransaction = (tx: TransactionInServerFormat) => {
  const { to, gasPrice, value, input, gas, nonce, chainId } = tx
  const serializableTx: TransactionSerializableLegacy = {
    type: "legacy",
    to: to,
    gasPrice: hexToBigInt(gasPrice),
    value: hexToBigInt(value),
    data: input,

    gas: hexToBigInt(gas),
    nonce: hexToNumber(nonce),

    chainId: hexToNumber(chainId),
  }
  const serializedTx = serializeTransaction(serializableTx)

  return serializedTx
}
