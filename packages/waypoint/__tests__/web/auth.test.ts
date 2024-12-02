import { afterEach, describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../web/core/communicate"
import { normalizeIdError } from "../../web/utils/error"
import { authorize, parseRedirectUrl } from "./../../web/auth"
import { CONFIG } from "./../constants"

describe("authorize function", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("should return valid parameters", async () => {
    const sampleToken = "sample-token"
    vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
      id_token: sampleToken,
      address: CONFIG.EXPECTED_ADDRESS,
      secondary_address: CONFIG.SECONDARY_ADDRESS,
    })
    const { address, secondaryAddress, token } = await authorize({
      clientId: CONFIG.CLIENT_ID,
      mode: "popup",
    })
    expect(token).toBe(sampleToken)
    expect(address).toBe(CONFIG.EXPECTED_ADDRESS)
    expect(secondaryAddress).toBe(CONFIG.SECONDARY_ADDRESS)
  })

  test("should return undefined with invalid addresses", async () => {
    const sampleToken = "sample-token"
    vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockResolvedValue({
      id_token: sampleToken,
      address: "invalid-address",
      secondary_address: "invalid-secondary-address",
    })
    const { address, secondaryAddress, token } = await authorize({
      clientId: CONFIG.CLIENT_ID,
      mode: "popup",
    })
    expect(token).toBe(sampleToken)
    expect(address).toBeUndefined()
    expect(secondaryAddress).toBeUndefined()
  })

  test("should throw error when sendRequest failed", async () => {
    vi.spyOn(CommunicateHelper.prototype, "sendRequest").mockRejectedValue(
      normalizeIdError({ code: 1000, message: "User rejected" }),
    )
    await expect(
      authorize({
        clientId: CONFIG.CLIENT_ID,
        mode: "popup",
      }),
    ).rejects.toThrowError("user reject action on Ronin Waypoint")
  })

  test("should return undefined in redirect mode", async () => {
    Object.defineProperty(window, "location", {
      value: { assign: vi.fn() },
      writable: true,
    })
    const result = await authorize({
      clientId: CONFIG.CLIENT_ID,
      mode: "redirect",
    })
    expect(result).toBeUndefined()
  })
})

describe("parseRedirectUrl", () => {
  test("should throw error invalid method", () => {
    const invalidMethods = ["other", ""]
    invalidMethods.forEach(method => {
      const url = new URL("http://localhost:3000")
      url.searchParams.set("method", method)
      Object.defineProperty(window, "location", {
        value: { href: url.toString() },
      })

      expect(parseRedirectUrl).toThrowError("parseRedirectUrl: invalid method")
    })
  })

  test("should throw error authorization failed", () => {
    const invalidTypes = ["fail", "other", ""]
    invalidTypes.forEach(type => {
      const url = new URL("http://localhost:3000?method=auth")
      url.searchParams.set("type", type)
      Object.defineProperty(window, "location", {
        value: { href: url.toString() },
      })

      expect(parseRedirectUrl).toThrowError("parseRedirectUrl: authorization failed")
    })
  })

  test("should return params matched with url params when they are not defined", () => {
    const url = new URL("http://localhost:3000?method=auth&type=success")

    Object.defineProperty(window, "location", {
      value: { href: url.toString() },
    })

    const { address, secondaryAddress, state, token } = parseRedirectUrl()

    expect(address).toBeUndefined()
    expect(secondaryAddress).toBeUndefined()
    expect(state).toBeNull()
    expect(token).toBeNull()
  })

  test("should return params matched with url params when they are defined", () => {
    const url = new URL("http://localhost:3000?method=auth&type=success")
    const stateParam = "sample-state"
    const dataParam = "sample-data"
    const addressParam = "0xDa75C7867F5151c655eD1587a22153A4D00BB41e"
    const secondaryAddressParam = "0x7C54794fFa03780483E54C10B333C0659c2c6641"
    url.searchParams.set("state", stateParam)
    url.searchParams.set("data", dataParam)
    url.searchParams.set("address", addressParam)
    url.searchParams.set("secondary_address", secondaryAddressParam)

    Object.defineProperty(window, "location", {
      value: { href: url.toString() },
    })

    const { address, secondaryAddress, state, token } = parseRedirectUrl()

    expect(address).toBe(addressParam)
    expect(secondaryAddress).toBe(secondaryAddressParam)
    expect(state).toBe(stateParam)
    expect(token).toBe(dataParam)
  })
})
