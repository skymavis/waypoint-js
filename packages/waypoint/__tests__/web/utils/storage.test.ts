import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import {
  getStorage,
  removeStorage,
  setStorage,
  STORAGE_ADDRESS_KEY,
  STORAGE_PREFIX,
} from "../../../web/utils/storage"

describe("Storage functions", () => {
  beforeEach(() => {
    globalThis.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 6,
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("should define constants for STORAGE_ADDRESS_KEY and STORAGE_PREFIX", () => {
    expect(STORAGE_ADDRESS_KEY).toBe("ADDRESS")
    expect(STORAGE_PREFIX).toBe("RONIN.WAYPOINT")
  })

  test("should get the correct value from localStorage when available", () => {
    const mockValue = "some-address-value"
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => mockValue)

    const result = getStorage(STORAGE_ADDRESS_KEY)

    expect(globalThis.localStorage.getItem).toHaveBeenCalledWith(
      `${STORAGE_PREFIX}:${STORAGE_ADDRESS_KEY}`,
    )
    expect(result).toBe(mockValue)
  })

  test("should return undefined when item is not found in localStorage", () => {
    globalThis.localStorage.getItem = vi.fn().mockReturnValue(null)

    const result = getStorage(STORAGE_ADDRESS_KEY)

    expect(result).toBeNull()
    expect(globalThis.localStorage.getItem).toHaveBeenCalledWith(
      `${STORAGE_PREFIX}:${STORAGE_ADDRESS_KEY}`,
    )
  })

  test("should set the correct value in localStorage", () => {
    const mockValue = "some-address-value"
    setStorage(STORAGE_ADDRESS_KEY, mockValue)

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
      `${STORAGE_PREFIX}:${STORAGE_ADDRESS_KEY}`,
      mockValue,
    )
  })

  test("should remove the correct item from localStorage", () => {
    removeStorage(STORAGE_ADDRESS_KEY)

    expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith(
      `${STORAGE_PREFIX}:${STORAGE_ADDRESS_KEY}`,
    )
  })

  test("should return false if localStorage is not available", () => {
    delete (globalThis.window as { localStorage?: Storage })["localStorage"]

    const result = getStorage(STORAGE_ADDRESS_KEY)
    expect(result).toBe(false)

    const setStorageResult = setStorage(STORAGE_ADDRESS_KEY, "test-value")
    expect(setStorageResult).toBe(false)

    const removeStorageResult = removeStorage(STORAGE_ADDRESS_KEY)
    expect(removeStorageResult).toBe(false)
  })
})
