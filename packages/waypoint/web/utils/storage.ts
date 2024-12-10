export const STORAGE_ADDRESS_KEY = "ADDRESS"
export const STORAGE_KEYS_OF_TRANSFER_SHARD_KEY = "KEYS_OF_TRANSFER_SHARD"
export const STORAGE_PREFIX = "RONIN.WAYPOINT"

const isStorageAvailable = () => typeof window !== "undefined" && "localStorage" in window

export const getStorage = (name: string) =>
  isStorageAvailable() && localStorage.getItem(`${STORAGE_PREFIX}:${name}`)

export const setStorage = (name: string, value: string) =>
  isStorageAvailable() && localStorage.setItem(`${STORAGE_PREFIX}:${name}`, value)

export const removeStorage = (name: string) =>
  isStorageAvailable() && localStorage.removeItem(`${STORAGE_PREFIX}:${name}`)
