import type { AccessList, Address, Hex } from "viem"

export type GenericTransaction = {
  // "0x64" for ronin gas sponsor
  type?: "0x0" | "0x1" | "0x2" | "0x64"

  nonce?: Hex
  to: Address | null
  from?: Address

  value?: Hex
  input?: Hex
  data?: Hex

  gas?: Hex
  gasPrice?: Hex

  // EIP-2930; Type 1 & EIP-1559; Type 2
  accessList?: AccessList

  // EIP-1559; Type 2
  maxPriorityFeePerGas?: Hex
  maxFeePerGas?: Hex
  maxFeePerBlobGas?: Hex
  blobVersionedHashes?: Array<Hex>
  blobs?: Array<Hex>

  chainId?: Hex
}

export type FilledTransaction = {
  // "0x64" for ronin gas sponsor
  type: "0x0" | "0x1" | "0x2" | "0x64"

  nonce?: Hex
  to: Address | null
  from: Address

  value: Hex
  input: Hex

  gas?: Hex
  gasPrice?: Hex

  // EIP-2930; Type 1 & EIP-1559; Type 2
  accessList: AccessList

  // EIP-1559; Type 2
  maxPriorityFeePerGas?: Hex
  maxFeePerGas?: Hex
  maxFeePerBlobGas: Hex
  blobVersionedHashes: Array<Hex>
  blobs: Array<Hex>

  chainId: Hex
}
