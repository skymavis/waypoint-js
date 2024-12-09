import type {
  Address,
  EIP1193Events,
  EIP1193Parameters,
  Hash,
  Hex,
  PublicRpcSchema,
  TypedDataDefinition,
} from "viem"

import type { GenericTransaction } from "../web/common/tx"

export interface Eip1193Provider extends EIP1193Events {
  request: <ReturnType = unknown>(
    args: EIP1193Parameters<RoninWaypointRequestSchema>,
  ) => Promise<ReturnType>
}

export type RoninWaypointRequestSchema = [
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
    Parameters: [transaction: GenericTransaction]
    ReturnType: Hash
  },
  {
    Method: "eth_signTypedData_v4"
    Parameters: [address: Address, typedData: TypedDataDefinition]
    ReturnType: Hex
  },
  {
    Method: "personal_sign"
    Parameters: [data: Hex, address: Address]
    ReturnType: Hex
  },
]

export enum Eip1193EventName {
  accountsChanged = "accountsChanged",
  chainChanged = "chainChanged",
  connect = "connect",
  disconnect = "disconnect",
  message = "message",
}
