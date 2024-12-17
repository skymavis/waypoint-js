import { jwtDecode } from "jwt-decode"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"

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

const BUFFER = 10
export const validateToken = (waypointToken: string) => {
  try {
    const { sub, exp } = jwtDecode<WaypointTokenPayload>(waypointToken)

    if (!sub) throw "Token does not have an subject (sub field)"
    if (!exp) throw "Token does not have an expiration time (exp field)"

    const currentUTCTime = new Date().getTime() / 1000
    if (currentUTCTime > exp - BUFFER) {
      throw `Token expired at ${new Date(exp * 1000).toString()} (exp="${exp}")`
    }

    return true
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.InvalidWaypointTokenError,
      message: `Unable to validate the waypoint token with value "${waypointToken}"`,
    })
  }
}
