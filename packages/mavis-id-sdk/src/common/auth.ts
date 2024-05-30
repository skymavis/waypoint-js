import { Address } from "viem"

export interface DecodedTokenInfo {
  aud: string[]
  email: string
  exp: number
  iat: number
  iss: string
  jti: string
  nbf: number
  scp: string
  sid: string
  sub: string

  // * BE will delete later
  ronin_address?: string
}

export interface IdAuthResponse {
  id_token: string
  address: string
}

export interface ProviderSavedProfile
  extends Pick<DecodedTokenInfo, "email" | "exp" | "iat" | "sub"> {
  address: Address
}
