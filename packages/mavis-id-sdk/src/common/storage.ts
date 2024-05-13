export const STORAGE_PROFILE_KEY = "PROFILE"

export const STORAGE_PREFIX = "MAVIS.ID"

const isLocalStorageAvailable = () => typeof window !== "undefined" && "localStorage" in window

export const getStorage = (name: string) =>
  isLocalStorageAvailable() && localStorage.getItem(`${STORAGE_PREFIX}:${name}`)

export const setStorage = (name: string, value: string) =>
  isLocalStorageAvailable() && localStorage.setItem(`${STORAGE_PREFIX}:${name}`, value)

export const removeStorage = (name: string) =>
  isLocalStorageAvailable() && localStorage.removeItem(`${STORAGE_PREFIX}:${name}`)
