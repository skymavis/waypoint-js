export type ClientShardStorage = {
  get: () => string | undefined
  set: (newShard: string) => boolean
}

export const DEFAULT_SHARD_STORAGE_KEY = "WAYPOINT:HEADLESS.SHARD"

const isStorageAvailable = () => typeof sessionStorage !== "undefined"

export const _defaultShardStorage: ClientShardStorage = {
  get: () => {
    if (!isStorageAvailable()) {
      return undefined
    }

    return sessionStorage.getItem(DEFAULT_SHARD_STORAGE_KEY) ?? undefined
  },
  set: newShard => {
    if (!isStorageAvailable()) {
      return false
    }

    sessionStorage.setItem(DEFAULT_SHARD_STORAGE_KEY, newShard)
    return true
  },
}
