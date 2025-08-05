import { jwtDecode } from "jwt-decode"

import { HeadlessCommonClientError, HeadlessCommonClientErrorCode } from "../error/client"
import { TokenCache } from "./token-cache"

export type ASAccessTokenPayload = {
  client_id?: string
}

export type WaypointTokenPayload = {
  iss?: "https://id.skymavis.com"
  sub?: string
  aud?: [string]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  sid?: string
  email?: string
  scp?: string
  roles?: [string]
}

export const addBearerPrefix = (waypointToken: string) => {
  return waypointToken.startsWith("Bearer ") ? waypointToken : "Bearer " + waypointToken
}

export const validateToken = (waypointToken: string): true => {
  const tokenCache = TokenCache.getInstance()

  const cachedInfo = tokenCache.getCachedTokenInfo(waypointToken)
  if (cachedInfo) {
    return true
  }

  try {
    const payload = jwtDecode<WaypointTokenPayload>(waypointToken)
    const { sub, exp } = payload

    if (!sub) throw "Token does not have an subject (sub field)"
    if (!exp) throw "Token does not have an expiration time (exp field)"

    if (tokenCache.isTokenExpired(exp)) {
      throw `Token expired at ${new Date(exp * 1000).toString()} (exp="${exp}")`
    }

    tokenCache.setCachedTokenInfo(waypointToken, payload)

    return true
  } catch (error) {
    throw new HeadlessCommonClientError({
      cause: error,
      code: HeadlessCommonClientErrorCode.InvalidWaypointTokenError,
      message: `Unable to validate the waypoint token with value "${waypointToken}"`,
    })
  }
}
