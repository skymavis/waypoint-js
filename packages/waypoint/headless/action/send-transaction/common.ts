import { type AccessList, type Address, type Hex, numberToHex, parseGwei } from "viem"

export const LEGACY_TYPE = "0x0" as const
export const RONIN_GAS_SPONSOR_TYPE = "0x64"
export const RONIN_GAS_PRICE = numberToHex(parseGwei("20"))

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
