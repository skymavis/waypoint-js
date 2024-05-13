export type AccessList = Array<{ address: string; storageKeys: Array<string> }>

export type AccessListish =
  | AccessList
  | Array<[string, Array<string>]>
  | Record<string, Array<string>>

export type BigNumberish = bigint | string | number

export type Bytes = ArrayLike<number>

export type BytesLike = Bytes | string

export const ZERO_TX_DATA = 0

export type IUnsignedTransaction = {
  to: string
  value: string
  from?: string
  nonce?: string
  data?: string
  type?: number
  gas?: string
  gasPrice?: string
  input?: string
  s?: string
  r?: string
  v?: string
  chainId?: string
  // Typed-Transaction features

  // EIP-2930; Type 1 & EIP-1559; Type 2
  accessList?: AccessListish

  // EIP-1559; Type 2
  maxPriorityFeePerGas?: BigNumberish
  maxFeePerGas?: BigNumberish
  // EIP-1559; Type 100
  payerS?: string
  payerR?: string
  payerV?: string
}
