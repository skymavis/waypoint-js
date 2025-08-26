import { jwtDecode } from "jwt-decode"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import type { WaypointTokenPayload } from "./token"

interface CachedTokenInfo {
  sub: string
  exp: number
  decodedAt: number
}

class TokenCache {
  private static instance: TokenCache
  private cache: Map<string, CachedTokenInfo> = new Map()
  private readonly BUFFER = 10

  static getInstance(): TokenCache {
    if (!TokenCache.instance) {
      TokenCache.instance = new TokenCache()
    }
    return TokenCache.instance
  }

  getCachedTokenInfo(token: string): CachedTokenInfo | null {
    const cached = this.cache.get(token)
    if (!cached) return null

    if (this.isTokenExpired(cached.exp)) {
      this.cache.delete(token)

      return null
    }

    return cached
  }

  setCachedTokenInfo(token: string, payload: WaypointTokenPayload): void {
    if (!payload.sub || !payload.exp) return

    this.cache.set(token, {
      sub: payload.sub,
      exp: payload.exp,
      decodedAt: Date.now(),
    })
  }

  isTokenExpired(exp: number): boolean {
    return Date.now() / 1000 > exp - this.BUFFER
  }

  validateToken(waypointToken: string): boolean {
    const cachedInfo = this.getCachedTokenInfo(waypointToken)
    if (cachedInfo) {
      return true
    }

    try {
      const payload = jwtDecode<WaypointTokenPayload>(waypointToken)
      const { sub, exp } = payload

      if (!sub) throw "Token does not have an subject (sub field)"
      if (!exp) throw "Token does not have an expiration time (exp field)"

      if (this.isTokenExpired(exp)) {
        throw `Token expired at ${new Date(exp * 1000).toString()} (exp="${exp}")`
      }

      this.setCachedTokenInfo(waypointToken, payload)

      return true
    } catch (error) {
      throw new HeadlessClientError({
        cause: error,
        code: HeadlessClientErrorCode.InvalidWaypointTokenError,
        message: `Unable to validate the waypoint token with value "${waypointToken}"`,
      })
    }
  }
}

export const tokenCache = TokenCache.getInstance()
