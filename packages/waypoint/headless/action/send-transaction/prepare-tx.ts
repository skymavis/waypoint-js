import {
  Address,
  createPublicClient,
  getAddress,
  hexToBigInt,
  hexToNumber,
  http,
  numberToHex,
  serializeTransaction,
  TransactionSerializableLegacy,
} from "viem"

import {
  ChainParams,
  LEGACY_TYPE,
  RONIN_GAS_PRICE,
  RONIN_GAS_SPONSOR_TYPE,
  TransactionParams,
} from "./common"

type PrepareTransactionParams = {
  transaction: TransactionParams
  chain: ChainParams
  currentAddress: Address
}

export const prepareLegacyTransaction = async (params: PrepareTransactionParams) => {
  const { chain, currentAddress, transaction } = params

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
  const { chainId, rpcUrl } = chain

  if (type !== LEGACY_TYPE) {
    throw "Invalid transaction type"
  }

  if (!to) {
    throw `Mpc do not support deploying contract - "to" is required`
  }

  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  })

  const filledNonce = nonce
    ? hexToNumber(nonce)
    : await publicClient.getTransactionCount({ address: currentAddress })

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

  const txInServerFormat = {
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
  } as const

  const serializableTx: TransactionSerializableLegacy = {
    type: "legacy",
    to: txInServerFormat.to,
    gasPrice: hexToBigInt(txInServerFormat.gasPrice),
    value: hexToBigInt(txInServerFormat.value),
    data: txInServerFormat.input,

    gas: hexToBigInt(txInServerFormat.gas),
    nonce: hexToNumber(txInServerFormat.nonce),

    chainId,
  }
  const serializedTx = serializeTransaction(serializableTx)

  return {
    serializedTx,
    txInServerFormat,
  }
}

export const prepareSponsoredTransaction = async (params: PrepareTransactionParams) => {
  const { chain, currentAddress, transaction } = params

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
  const { chainId, rpcUrl } = chain

  if (type !== RONIN_GAS_SPONSOR_TYPE) {
    throw "Invalid transaction type"
  }

  if (!to) {
    throw `Mpc do not support deploying contract - "to" is required`
  }

  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  })

  const filledNonce = nonce
    ? hexToNumber(nonce)
    : await publicClient.getTransactionCount({ address: currentAddress })

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

  const txInServerFormat = {
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
    payerS: "0x3caeb99cc6659c5ca4c66b91b1686a86fe0493e1122bdd09f2babdf72e54041a",
    payerR: "0xdbdbd0989f595c0921acaf9c80342bbeff3b8ea6d2a9ad3167e63010715de3fd",
    payerV: "0x1",
    r: "0x0",
    v: "0x0",
    s: "0x0",
    maxFeePerGas: "0x4e3b29200",
    maxPriorityFeePerGas: "0x4e3b29200",
    expiredTime: "0x5208",
  } as const

  return txInServerFormat
}
