export const STORAGE_PROFILE_KEY = "PROFILE"
export const STORAGE_PREFIX = "MAVIS.ID"

const isStorageAvailable = () => typeof window !== "undefined" && "localStorage" in window

export const getStorage = (name: string) =>
  isStorageAvailable() && localStorage.getItem(`${STORAGE_PREFIX}:${name}`)

export const setStorage = (name: string, value: string) =>
  isStorageAvailable() && localStorage.setItem(`${STORAGE_PREFIX}:${name}`, value)

export const removeStorage = (name: string) =>
  isStorageAvailable() && localStorage.removeItem(`${STORAGE_PREFIX}:${name}`)
