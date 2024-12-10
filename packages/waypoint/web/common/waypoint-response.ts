export type WaypointResponse = {
  id_token: string
  address?: string
  secondary_address?: string
}

export type DelegationAuthorizeResponse = WaypointResponse & {
  wallet_key: string
}
