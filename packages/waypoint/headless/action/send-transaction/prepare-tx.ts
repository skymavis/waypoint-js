import {
  type Address,
  Client,
  createClient,
  Hex,
  hexToBigInt,
  hexToNumber,
  http,
  isAddress,
  numberToHex,
} from "viem"
import { estimateGas, getTransactionCount } from "viem/actions"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { isSupportedTransaction } from "../helpers/tx-type-check"
import {
  type ChainParams,
  PAYER_INFO,
  SupportedTransactionType,
  type TransactionInServerFormat,
  type TransactionParams,
  TransactionType,
} from "./common"
import { estimateFeesPerGas } from "./estimate-fee-per-gas"

const DEFAULT_VALUE = "0x0"
const DEFAULT_DATA = "0x"
const GAS_LIMIT_BUFFER_MULTIPLIER = 2n
const EXPIRED_TIME_PLACEHOLDER = "0x5208"

function validateTransactionType(type: TransactionType | undefined): SupportedTransactionType {
  if (!isSupportedTransaction(type))
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
      message: `Transaction type "${type}" is not supported. Supported types: legacy (0x0), EIP1559 (0x2), sponsored (0x64).`,
    })
  return type as SupportedTransactionType
}

function validateToAddress(to: Address | null): Address {
  if (!to || !isAddress(to))
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
      message: `Invalid 'to' address: ${to}.`,
    })
  return to
}

function validateFromAddress(from: Address | undefined): Address {
  if (!from || !isAddress(from))
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: `Invalid 'from' address: ${from}.`,
    })
  return from
}

async function estimateGasLimit(
  client: Client,
  params: {
    to: Address
    from: Address
    value: Hex
    data: Hex
    gas?: Hex
  },
): Promise<Hex> {
  try {
    const { to, from, value, data, gas } = params
    if (gas) return gas
    const baseGasLimit = await estimateGas(client, {
      to,
      account: from,
      value: hexToBigInt(value),
      data,
    })
    return numberToHex(baseGasLimit * GAS_LIMIT_BUFFER_MULTIPLIER)
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message:
        "Failed to estimate gas limit. This could be due to network issues or invalid transaction parameters.",
    })
  }
}

async function getNonceFromNetwork(
  client: Client,
  params: { from: Address; nonce?: Hex },
): Promise<number> {
  try {
    const { from, nonce } = params
    if (nonce) return hexToNumber(nonce)
    return await getTransactionCount(client, {
      address: from,
      blockTag: "pending",
    })
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message:
        "Failed to get transaction nonce. This could be due to network issues or RPC problems.",
    })
  }
}

type FormatTransactionParams = {
  transaction: TransactionParams
  chain: ChainParams
  currentAddress?: Address
}

export const toTransactionInServerFormat = async (
  params: FormatTransactionParams,
): Promise<TransactionInServerFormat> => {
  const {
    chain: { chainId, rpcUrl },
    currentAddress,
    transaction,
  } = params

  const {
    value = DEFAULT_VALUE,
    data = DEFAULT_DATA,
    from: rawFrom = currentAddress,
    to: rawTo,
    type: rawType,
    gasPrice: rawGasPrice,
    nonce: rawNonce,
    input,
    gas,
  } = transaction

  const type = validateTransactionType(rawType)
  const to = validateToAddress(rawTo)
  const from = validateFromAddress(rawFrom)
  const client = createClient({ transport: http(rpcUrl) })
  const transactionData = input ?? data

  try {
    const [nonce, feesPerGas, gasLimit] = await Promise.all([
      getNonceFromNetwork(client, { from, nonce: rawNonce }),
      estimateFeesPerGas(client, { type, chainId, gasPrice: rawGasPrice }),
      estimateGasLimit(client, { to, from, value, gas, data: transactionData }),
    ])

    const nonceHex = numberToHex(nonce)
    const chainIdHex = numberToHex(chainId)
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = feesPerGas

    const formattedTransaction: TransactionInServerFormat = {
      type,
      from,
      to,
      value,
      input: transactionData,
      gasPrice,
      gas: gasLimit,
      nonce: nonceHex,
      chainId: chainIdHex,
      maxFeePerGas,
      maxPriorityFeePerGas,
      r: DEFAULT_VALUE,
      v: DEFAULT_VALUE,
      s: DEFAULT_VALUE,
      payerS: PAYER_INFO.s,
      payerR: PAYER_INFO.r,
      payerV: PAYER_INFO.v,
      expiredTime: EXPIRED_TIME_PLACEHOLDER,
    }

    return formattedTransaction
  } catch (error) {
    if (error instanceof HeadlessClientError) {
      throw error
    }

    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: "Failed to prepare transaction for server format.",
    })
  }
}
