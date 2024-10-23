export interface ClientShardStorage {
  get: () => string | undefined
  set: (newShard: string) => boolean
}

export const DEFAULT_SHARD_STORAGE_KEY = "WAYPOINT:HEADLESS.SHARD"

const isStorageAvailable = () => typeof localStorage !== "undefined"

export const _defaultShardStorage: ClientShardStorage = {
  get: () => {
    if (!isStorageAvailable()) {
      return undefined
    }

    return localStorage.getItem(DEFAULT_SHARD_STORAGE_KEY) ?? undefined
  },
  set: newShard => {
    if (!isStorageAvailable()) {
      return false
    }

    localStorage.setItem(DEFAULT_SHARD_STORAGE_KEY, newShard)
    return true
  },
}
