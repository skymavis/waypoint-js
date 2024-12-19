import {
  type Address,
  createClient,
  hexToBigInt,
  hexToNumber,
  http,
  isAddress,
  isHex,
  numberToHex,
  serializeTransaction,
  type TransactionSerializableLegacy,
} from "viem"
import { getTransactionCount } from "viem/actions"

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
  currentAddress?: Address
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
    value = "0x0",
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

  if (!to || !isAddress(to)) {
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
      message: `The transaction with to="${to}" (deploying new contracts) is not supported.`,
    })
  }

  if (!from || !isAddress(from)) {
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: `The transaction with from="${from}" is not valid.`,
    })
  }

  if (!gas || !isHex(gas)) {
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: `The transaction with gas="${gas}" is not valid.`,
    })
  }

  const fillNonce = async () => {
    try {
      if (isHex(nonce)) {
        return hexToNumber(nonce)
      }

      const client = createClient({
        transport: http(rpcUrl),
      })

      return await getTransactionCount(client, { address: from, blockTag: "pending" })
    } catch (error) {
      throw new HeadlessClientError({
        cause: error,
        code: HeadlessClientErrorCode.PrepareTransactionError,
        message: `Unable to get nonce when preparing the transaction. This could be due to a slow network or an RPC status.`,
      })
    }
  }
  const filledNonce = await fillNonce()

  try {
    const formattedTransaction: TransactionInServerFormat = {
      type,
      from,
      to,
      value,
      input: input ?? data,
      gasPrice,

      gas,
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
      message: `Unable to transform transaction data to server format.`,
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
