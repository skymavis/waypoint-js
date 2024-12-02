import { Hex } from "viem"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../../web/core/communicate"
import { normalizeIdError } from "../../../web/utils/error"
import { CONFIG } from "../../constants"
import { signTypedDataV4 } from "./../../../web/core/sign-data"

describe("Sign Type Data", () => {
  const communicateHelper = new CommunicateHelper(CONFIG.WAYPOINT_ORIGIN)
  const baseTypeDataParams = {
    chainId: CONFIG.CHAIN_ID,
    clientId: CONFIG.CLIENT_ID,
    communicateHelper,
    expectAddress: CONFIG.EXPECTED_ADDRESS as Hex,
    waypointOrigin: CONFIG.WAYPOINT_ORIGIN,
  }
  const SIGN_DATA = {
    types: {
      Asset: [
        { name: "erc", type: "uint8" },
        { name: "addr", type: "address" },
        { name: "id", type: "uint256" },
        { name: "quantity", type: "uint256" },
      ],
      Order: [
        { name: "maker", type: "address" },
        { name: "kind", type: "uint8" },
        { name: "assets", type: "Asset[]" },
        { name: "expiredAt", type: "uint256" },
        { name: "paymentToken", type: "address" },
        { name: "startedAt", type: "uint256" },
        { name: "basePrice", type: "uint256" },
        { name: "endedAt", type: "uint256" },
        { name: "endedPrice", type: "uint256" },
        { name: "expectedState", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "marketFeePercentage", type: "uint256" },
      ],
    },
    domain: {
      name: "MarketGateway",
      version: "1",
      chainId: 2021,
      verifyingContract: "0xfff9ce5f71ca6178d3beecedb61e7eff1602950e" as Hex,
    },
    primaryType: "Order",
    message: {
      maker: "0xd761024b4ef3336becd6e802884d0b986c29b35a",
      kind: 1,
      assets: [
        {
          erc: 1,
          addr: "0x32950db2a7164ae833121501c797d79e7b79d74c",
          id: "2730069",
          quantity: "0",
        },
      ],
      expiredAt: "1721709637",
      paymentToken: "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5",
      startedAt: "1705984837",
      basePrice: "500000000000000000",
      endedAt: "0",
      endedPrice: "0",
      expectedState: "0",
      nonce: "0",
      marketFeePercentage: "425",
    },
  }
  let signData: typeof SIGN_DATA
  const validSignTypedDataResponse = "0x1111111111"

  beforeEach(() => {
    signData = JSON.parse(JSON.stringify(SIGN_DATA))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("should return valid signature", () => {
    const testCases = [JSON.stringify(signData), signData]
    testCases.forEach(async signData => {
      vi.spyOn(communicateHelper, "sendRequest").mockResolvedValue(validSignTypedDataResponse)
      const request = await signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, signData],
      })

      expect(request).toBe(validSignTypedDataResponse)
    })
  })

  test("should throw error data is not defined", async () => {
    const emptySignData = ""
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, emptySignData],
      }),
    ).rejects.toThrowError("eth_signTypedData_v4: data is NOT define")
  })

  test("should throw error current address is different from required address", async () => {
    const invalidSignAddress = "0x7C54794fFa03780483E54C10B333C0659c2c6641"
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [invalidSignAddress, signData],
      }),
    ).rejects.toThrowError(
      "eth_signTypedData_v4: current address is different from required address",
    )
  })

  test("should throw error could not parse typed data", async () => {
    const invalidSignData = "data message"
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, invalidSignData],
      }),
    ).rejects.toThrowError("eth_signTypedData_v4: could NOT parse typed data")
  })

  test("should throw error invalid typed data", async () => {
    const requiredProperties = ["types", "domain", "primaryType", "message"]
    requiredProperties.forEach(async properties => {
      const invalidSignData = { ...signData }
      delete invalidSignData[properties]
      await expect(
        signTypedDataV4({
          ...baseTypeDataParams,
          params: [baseTypeDataParams.expectAddress, invalidSignData],
        }),
      ).rejects.toThrowError(
        "eth_signTypedData_v4: invalid typed data - required types, domain, primaryType, message",
      )
    })
  })

  test("should throw error chainId is not defined", async () => {
    const invalidSignData = { ...signData }
    ;(invalidSignData.domain.chainId as number | undefined) = undefined
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, invalidSignData],
        chainId: CONFIG.CHAIN_ID,
      }),
    ).rejects.toThrowError(
      `eth_signTypedData_v4: chainId is NOT defined - expected ${CONFIG.CHAIN_ID}`,
    )
  })

  test("should throw error chainId is not valid", async () => {
    const invalidSignData = { ...signData }
    invalidSignData.domain.chainId = 2022
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, invalidSignData],
        chainId: CONFIG.CHAIN_ID,
      }),
    ).rejects.toThrowError(
      `eth_signTypedData_v4: chainId is NOT valid - expected ${CONFIG.CHAIN_ID}`,
    )
  })

  test("should throw error signature is not valid", async () => {
    const invalidSignature = "000000"
    vi.spyOn(communicateHelper, "sendRequest").mockResolvedValue(invalidSignature)
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, signData],
      }),
    ).rejects.toThrowError("eth_signTypedData_v4: signature is not valid")
  })

  test("should throw user reject error", async () => {
    vi.spyOn(communicateHelper, "sendRequest").mockRejectedValue(
      normalizeIdError({ code: 1000, message: "User reject" }),
    )
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, signData],
      }),
    ).rejects.toThrowError("user reject action on Ronin Waypoint")
  })

  test("should throw unknown error", async () => {
    vi.spyOn(communicateHelper, "sendRequest").mockRejectedValue({ code: 2010 })
    await expect(
      signTypedDataV4({
        ...baseTypeDataParams,
        params: [baseTypeDataParams.expectAddress, signData],
      }),
    ).rejects.toThrowError("unknown error")
  })
})
