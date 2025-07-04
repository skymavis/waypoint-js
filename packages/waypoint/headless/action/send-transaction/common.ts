import { type AccessList, type Address, type Hex, numberToHex, parseGwei } from "viem"

export const LEGACY_TYPE = "0x0"
export const RONIN_GAS_SPONSOR_TYPE = "0x64"
// TODO: Support EIP-1559
export const RONIN_GAS_PRICE = numberToHex(parseGwei("22"))

export const PAYER_INFO = {
  s: "0x3caeb99cc6659c5ca4c66b91b1686a86fe0493e1122bdd09f2babdf72e54041a",
  r: "0xdbdbd0989f595c0921acaf9c80342bbeff3b8ea6d2a9ad3167e63010715de3fd",
  v: "0x1",
} as const

export type TransactionParams = {
  // * "0x64" for ronin gas sponsor
  type?: "0x0" | "0x1" | "0x2" | "0x64"

  // * auto fill
  nonce?: Hex
  // * null when creating new contract
  to: Address | null
  // * auto fill with current address
  from?: Address

  value?: Hex
  input?: Hex
  data?: Hex

  // * auto fill
  gas?: Hex
  // * auto fill
  gasPrice?: Hex

  // * ronin do NOT support "0x1" and "0x2" type
  // * EIP-2930; Type 1 & EIP-1559; Type 2
  accessList?: AccessList

  // * EIP-1559; Type 2
  maxPriorityFeePerGas?: Hex
  maxFeePerGas?: Hex
  maxFeePerBlobGas?: Hex
  blobVersionedHashes?: Array<Hex>
  blobs?: Array<Hex>
}
export type ChainParams = {
  chainId: number
  rpcUrl: string
}

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

export type TransactionInServerFormat = {
  type: "0x0" | "0x64"
  from: Address
  to: Address
  value: Hex
  input: Hex
  gasPrice: Hex

  gas: Hex
  nonce: Hex

  // chainId for processing the transaction
  chainId: Hex

  // placeholder fields
  r: Hex
  v: Hex
  s: Hex
  payerS: Hex
  payerR: Hex
  payerV: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
  expiredTime: Hex
}
