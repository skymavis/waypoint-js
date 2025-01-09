import { Prettify, RequiredBy } from "viem"

export type WaypointResponse = {
  id_token: string
  address?: string
  secondary_address?: string
}

export type WaypointResponseWithWallet = Prettify<RequiredBy<WaypointResponse, "address">>

export type DelegationAuthorizeResponse = WaypointResponse & {
  wallet_key: string
}
