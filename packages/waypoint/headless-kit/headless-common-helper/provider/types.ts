import {
  Address,
  EIP1193Events,
  EIP1193Parameters,
  Hash,
  Hex,
  PublicRpcSchema,
  TypedDataDefinition,
} from "viem"

import { TransactionParams } from "../transaction/common"

export type HeadlessProviderBaseType = EIP1193Events & {
  request: <ReturnType = unknown>(
    args: EIP1193Parameters<HeadlessProviderBaseSchema>,
  ) => Promise<ReturnType>
}

export type HeadlessProviderBaseSchema = [
  ...PublicRpcSchema,

  {
    Method: "eth_accounts"
    Parameters?: undefined
    ReturnType: Address[]
  },
  {
    Method: "eth_requestAccounts"
    Parameters?: undefined
    ReturnType: Address[]
  },
  {
    Method: "eth_sendTransaction"
    Parameters: [transaction: TransactionParams]
    ReturnType: Hash
  },
  {
    Method: "eth_signTypedData_v4"
    Parameters: [address: Address, typedData: TypedDataDefinition | string]
    ReturnType: Hex
  },
  {
    Method: "personal_sign"
    Parameters: [data: Hex, address: Address]
    ReturnType: Hex
  },
]
