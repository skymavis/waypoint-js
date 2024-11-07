import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { Address, ChainDisconnectedError, UnauthorizedProviderError } from "viem"

import { CommunicateHelper } from "../core/communicate"
import { WaypointProvider } from "../provider"
import * as storageUtils from "../utils/storage"

// Mock dependencies
jest.mock("../core/communicate")
jest.mock("../utils/popup")
jest.mock("../utils/storage")

describe("WaypointProvider", () => {
  const mockClientId = "test-client-id"
  const mockChainId = 2020 // Ronin chain ID
  let provider: WaypointProvider

  beforeEach(() => {
    provider = WaypointProvider.create({
      clientId: mockClientId,
      chainId: mockChainId,
    })
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should create a new instance with default values", () => {
      expect(provider).toBeInstanceOf(WaypointProvider)
      expect(provider.chainId).toBe(mockChainId)
    })

    it("should throw ChainDisconnectedError for unsupported chain", () => {
      expect(() =>
        WaypointProvider.create({
          clientId: mockClientId,
          chainId: 999999, // Invalid chain ID
        }),
      ).toThrow(ChainDisconnectedError)
    })
  })

  describe("connect", () => {
    const mockAddress = "0xfABe2C639166C16Ca5BB58bED0Fe30E1d491661f" as Address
    const mockToken = "mock-token"

    beforeEach(() => {
      // Mock successful connection response
      jest.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: mockToken,
        address: mockAddress,
      })
    })

    it("should connect and return token and address", async () => {
      const result = await provider.connect()

      expect(result).toEqual({
        token: mockToken,
        address: mockAddress,
      })
      // expect(storageUtils.setStorage).toHaveBeenCalledWith("waypoint_address", mockAddress)
    })

    it("should throw UnauthorizedProviderError when address is invalid", async () => {
      jest.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: mockToken,
        address: "", // Invalid address
      })

      await expect(provider.connect()).rejects.toThrow(UnauthorizedProviderError)
    })
  })

  describe("request", () => {
    it("should return chain ID for eth_chainId", async () => {
      const result = await provider.request({ method: "eth_chainId" })
      expect(result).toBe("0x7e4") // hex for 2020
    })

    it("should return empty array for eth_accounts when not connected", async () => {
      const result = await provider.request({ method: "eth_accounts" })
      expect(result).toEqual([])
    })

    it("should return cached address for eth_accounts when connected", async () => {
      const mockAddress = "0x123" as Address
      jest.spyOn(storageUtils, "getStorage").mockReturnValue(mockAddress)

      const result = await provider.request({ method: "eth_accounts" })
      expect(result).toEqual([mockAddress])
    })

    it("should connect and return address for eth_requestAccounts", async () => {
      const mockAddress = "0x123" as Address
      jest.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: "mock-token",
        address: mockAddress,
      })

      const result = await provider.request({ method: "eth_requestAccounts" })
      expect(result).toEqual([mockAddress])
    })
  })

  describe("disconnect", () => {
    it("should clear storage and emit events when previously connected", async () => {
      // Setup connected state
      const mockAddress = "0x123" as Address
      jest.spyOn(storageUtils, "getStorage").mockReturnValue(mockAddress)
      const emitSpy = jest.spyOn(provider, "emit")

      provider.disconnect()

      expect(storageUtils.removeStorage).toHaveBeenCalledWith("waypoint_address")
      expect(emitSpy).toHaveBeenCalledWith("accountsChanged", [])
      expect(emitSpy).toHaveBeenCalledWith("disconnect", expect.any(Error))
    })

    it("should not emit events when not previously connected", () => {
      const emitSpy = jest.spyOn(provider, "emit")

      provider.disconnect()

      expect(emitSpy).not.toHaveBeenCalled()
    })
  })
})
