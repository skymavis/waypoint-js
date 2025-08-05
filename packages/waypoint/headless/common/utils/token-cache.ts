import type { WaypointTokenPayload } from "./token"

export interface CachedTokenInfo {
  sub: string
  exp: number
  decodedAt: number
}

export class TokenCache {
  private static instance: TokenCache
  private cache: Map<string, CachedTokenInfo> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly BUFFER = 10
  private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000

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

      if (this.cache.size === 0) {
        this.stopCleanupInterval()
      }

      return null
    }

    return cached
  }

  setCachedTokenInfo(token: string, payload: WaypointTokenPayload): void {
    if (!payload.sub || !payload.exp) return

    const shouldStartInterval = this.cache.size === 0

    this.cache.set(token, {
      sub: payload.sub,
      exp: payload.exp,
      decodedAt: Date.now(),
    })

    if (shouldStartInterval) {
      this.startCleanupInterval()
    }
  }

  isTokenExpired(exp: number): boolean {
    return Date.now() / 1000 > exp - this.BUFFER
  }

  private cleanExpiredTokens(): void {
    for (const [token, info] of this.cache.entries()) {
      if (this.isTokenExpired(info.exp)) {
        this.cache.delete(token)
      }
    }

    if (this.cache.size === 0) {
      this.stopCleanupInterval()
    }
  }

  private startCleanupInterval(): void {
    if (this.cleanupInterval === null) {
      this.cleanupInterval = setInterval(() => {
        this.cleanExpiredTokens()
      }, this.CLEANUP_INTERVAL_MS)
    }
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}
