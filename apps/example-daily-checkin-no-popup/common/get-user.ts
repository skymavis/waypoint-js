import { jwtDecode } from "jwt-decode"
import { isAddress } from "viem"

import { WP_ADDRESS_STORAGE_KEY, WP_TOKEN_STORAGE_KEY } from "./storage"

export type WaypointTokenPayload = {
  iss: string
  sub: string
  aud: Array<string>
  exp: number
  nbf: number
  iat: number
  jti: string
  sid: string
  email: string
  scp: string
  roles: Array<string>
}

export const getUser = () => {
  const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY)
  const address = localStorage.getItem(WP_ADDRESS_STORAGE_KEY)

  if (!token || !address) {
    throw "getUser: could NOT get token & address"
  }

  if (!isAddress(address)) {
    throw "getUser: address is NOT valid"
  }

  const tokenPayload = jwtDecode<WaypointTokenPayload>(token)

  const currentUTCTime = new Date().getTime() / 1000
  if (currentUTCTime > tokenPayload.exp) {
    throw "getUser: token is expired"
  }

  return {
    address,
    tokenPayload,
  }
}
