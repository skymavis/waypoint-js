import { jwtDecode } from "jwt-decode"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"

export const addBearerPrefix = (waypointToken: string) => {
  return waypointToken.startsWith("Bearer ") ? waypointToken : "Bearer " + waypointToken
}

const BUFFER = 10
export const validateToken = (waypointToken: string) => {
  try {
    const { sub, exp } = jwtDecode(waypointToken)

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
