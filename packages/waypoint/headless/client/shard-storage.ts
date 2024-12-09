export type ClientShardStorage = {
  get: () => string
  set: (newShard: string) => boolean
}

export const DEFAULT_SHARD_STORAGE_KEY = "WAYPOINT:HEADLESS.SHARD"

const isStorageAvailable = () => typeof sessionStorage !== "undefined"

export const _defaultShardStorage: ClientShardStorage = {
  get: () => {
    if (!isStorageAvailable()) {
      return ""
    }

    return sessionStorage.getItem(DEFAULT_SHARD_STORAGE_KEY) ?? ""
  },
  set: newShard => {
    if (!isStorageAvailable()) {
      return false
    }

    sessionStorage.setItem(DEFAULT_SHARD_STORAGE_KEY, newShard)
    return true
  },
}
