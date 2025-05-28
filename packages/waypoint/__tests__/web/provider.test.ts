import { Hex, toHex } from "viem"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../common/communicate"
import { name, version } from "../../common/version"
import { normalizeWaypointError } from "../../common/waypoint-error"
import { WaypointProvider } from "../../web/provider"
import { CONFIG } from "./../constants"

describe("Waypoint Provider", () => {
  test("create WaypointProvider", () => {
    const waypointProvider = WaypointProvider.create({
      chainId: CONFIG.CHAIN_ID,
      clientId: CONFIG.CLIENT_ID,
    })

    expect(waypointProvider).toBeDefined()
    expect(waypointProvider.chainId).toBe(CONFIG.CHAIN_ID)
    expect(waypointProvider.connect).toBeDefined()
    expect(waypointProvider.disconnect).toBeDefined()
    expect(waypointProvider.request).toBeDefined()
    expect(waypointProvider.config.popupCloseDelay).toBeUndefined()
    expect(waypointProvider.config.source).toBe(`${name}@${version}`)
  })

  test("create WaypointProvider with custom config", () => {
    const waypointProvider = WaypointProvider.create({
      chainId: CONFIG.CHAIN_ID,
      clientId: CONFIG.CLIENT_ID,
      popupCloseDelay: 3000,
      source: "@sky-mavis/tanto-widget@0.0.1",
    })

    expect(waypointProvider.config.popupCloseDelay).toBe(3000)
    expect(waypointProvider.config.source).toBe("@sky-mavis/tanto-widget@0.0.1")
  })

  const sampleToken = "sample-token"
  describe("connect function", () => {
    test("should return valid token and address", async () => {
      vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: sampleToken,
        address: CONFIG.EXPECTED_ADDRESS,
      })
      const waypointProvider = WaypointProvider.create({
        chainId: CONFIG.CHAIN_ID,
        clientId: CONFIG.CLIENT_ID,
      })
      const { address, token } = await waypointProvider.connect()
      expect(address).toBe(CONFIG.EXPECTED_ADDRESS)
      expect(token).toBe(sampleToken)
    })

    test("should throw error invalid address", async () => {
      vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: sampleToken,
        address: "invalid-address",
      })
      const waypointProvider = WaypointProvider.create({
        chainId: CONFIG.CHAIN_ID,
        clientId: CONFIG.CLIENT_ID,
      })

      await expect(waypointProvider.connect).rejects.toThrowError(
        "Ronin Waypoint do NOT return valid address",
      )
    })

    test("should throw user reject error", async () => {
      vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockRejectedValue(
        normalizeWaypointError({ code: 1000, message: "User rejected" }),
      )
      const waypointProvider = WaypointProvider.create({
        chainId: CONFIG.CHAIN_ID,
        clientId: CONFIG.CLIENT_ID,
      })

      await expect(waypointProvider.connect).rejects.toThrowError(
        "user reject action on Ronin Waypoint",
      )
    })
  })

  describe("disconnect function", () => {
    test("account address should be clear after disconnected", async () => {
      vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: sampleToken,
        address: CONFIG.EXPECTED_ADDRESS,
      })
      const waypointProvider = WaypointProvider.create({
        chainId: CONFIG.CHAIN_ID,
        clientId: CONFIG.CLIENT_ID,
      })
      await waypointProvider.connect()

      waypointProvider.disconnect()
      const accounts = await waypointProvider.request<Array<string>>({ method: "eth_accounts" })
      const address = accounts.find(addr => addr === CONFIG.EXPECTED_ADDRESS)
      expect(address).toBeUndefined()
    })
  })

  describe("request function", () => {
    let waypointProvider: WaypointProvider
    beforeEach(() => {
      waypointProvider = WaypointProvider.create({
        chainId: CONFIG.CHAIN_ID,
        clientId: CONFIG.CLIENT_ID,
      })
    })
    afterEach(() => {
      vi.restoreAllMocks()
    })

    test("request chain ID in hex, method: eth_chainId", async () => {
      await expect(waypointProvider.request<Hex>({ method: "eth_chainId" })).resolves.toBe(
        toHex(CONFIG.CHAIN_ID),
      )
    })

    test("request connected accounts should be array of string, method: eth_accounts", async () => {
      vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: sampleToken,
        address: CONFIG.EXPECTED_ADDRESS,
      })
      await waypointProvider.connect()
      const accounts = await waypointProvider.request<Array<string>>({
        method: "eth_accounts",
      })
      accounts.map(address => {
        expect(typeof address).toBe("string")
      })
    })

    test("request requested account should be string and unique, method: eth_requestAccounts", async () => {
      vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
        id_token: sampleToken,
        address: CONFIG.EXPECTED_ADDRESS,
      })
      await waypointProvider.connect()
      const accounts = await waypointProvider.request<Array<string>>({
        method: "eth_requestAccounts",
      })

      expect(accounts.length).toBe(1)
      expect(typeof accounts[0]).toBe("string")
    })

    describe("personal sign", () => {
      const mockResultSendRequest = "0x0000000000"
      const mockParamData = "0x48656c6c6f"
      let signWpProvider: WaypointProvider
      beforeEach(() => {
        signWpProvider = WaypointProvider.create({
          chainId: CONFIG.CHAIN_ID,
          clientId: CONFIG.CLIENT_ID,
        })
      })
      afterEach(() => {
        vi.restoreAllMocks()
      })

      test("should throw UnauthorizedProviderError if the address does not match expectAddress", async () => {
        vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
          id_token: sampleToken,
          address: CONFIG.EXPECTED_ADDRESS,
        })
        await signWpProvider.connect()
        await expect(
          signWpProvider.request({
            method: "personal_sign",
            params: [mockParamData, "0x1111111111111111111111111111111111111111"],
          }),
        ).rejects.toThrowError("current address is different from required address")
      })

      test("should return a valid signature for a correct non-hex message", async () => {
        vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
          id_token: sampleToken,
          address: CONFIG.EXPECTED_ADDRESS,
        })
        await signWpProvider.connect()
        vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue(
          mockResultSendRequest,
        )
        await expect(
          signWpProvider.request({
            method: "personal_sign",
            params: [mockParamData, CONFIG.EXPECTED_ADDRESS as Hex],
          }),
        ).resolves.toBe(mockResultSendRequest)
      })
    })

    test("eth_signTypedData_v4", () => {
      // same as personal_sign method
      // reference: __tests__/web/core/sign-data.test.ts
    })

    test("eth_sendTransaction", () => {
      // same as personal_sign method
      // reference: __tests__/web/core/send-tx.test.ts
    })
  })
})
