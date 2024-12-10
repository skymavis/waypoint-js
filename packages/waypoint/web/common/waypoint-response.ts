export type WaypointResponse = {
  id_token: string
  address?: string
  secondary_address?: string
}

export type TransferClientShardResponse = WaypointResponse & {
  wallet_key: string
}
