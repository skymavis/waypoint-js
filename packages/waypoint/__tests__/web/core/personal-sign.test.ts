import { Hex } from "viem"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../../common/communicate"
import { normalizeWaypointError } from "../../../common/waypoint-error"
import { personalSign } from "./../../../web/core/personal-sign"
import { CONFIG } from "./../../constants"

describe("personalSign", () => {
  const mockParamData = "0x48656c6c6f"
  const mockAddress = "0x0409e230c2F24db1ff119C3A4681aD884A38D646"
  const mockResultSendRequest = "0x0000000000"
  const baseSignParams = {
    expectAddress: CONFIG.EXPECTED_ADDRESS as Hex,
    clientId: CONFIG.CLIENT_ID,
    waypointOrigin: CONFIG.WAYPOINT_ORIGIN,
  }

  const communicateHelper = new CommunicateHelper(CONFIG.WAYPOINT_ORIGIN)
  beforeEach(() => {
    vi.spyOn(communicateHelper, "sendRequest").mockResolvedValue(mockResultSendRequest)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("should throw error if the address does not match expectAddress", async () => {
    await expect(
      personalSign({
        params: [mockParamData, "0x1111111111111111111111111111111111111111"],
        communicateHelper: communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrowError("personal_sign: current address is different from required address")
  })

  test("should throw error if the addresses is invalid", async () => {
    const invalidAddress = "0x111111111111"
    await expect(
      personalSign({
        params: [mockParamData, invalidAddress],
        communicateHelper: communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrowError(`Address "${invalidAddress}" is invalid.`)
  })

  test("should throw error if the data is empty", async () => {
    await expect(
      personalSign({
        params: ["" as Hex, mockAddress],
        communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrowError("personal_sign: message is NOT define")
  })

  test("should throw error if the signature is not a valid hex", async () => {
    // overwrite sendRequest resolved value
    vi.spyOn(communicateHelper, "sendRequest").mockResolvedValue("000")

    await expect(
      personalSign({
        params: [mockParamData, mockAddress],
        communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrowError("personal_sign: signature is not valid")
  })
  test("should throw error if the sendRequest got user reject", async () => {
    // overwrite sendRequest rejected value
    vi.spyOn(communicateHelper, "sendRequest").mockRejectedValue(
      normalizeWaypointError({ code: 1000, message: "User reject" }),
    )

    await expect(
      personalSign({
        params: [mockParamData, mockAddress],
        communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrowError("user reject action on Ronin Waypoint")
  })

  test("should return a valid signature for a correct hex message", async () => {
    const result = await personalSign({
      params: [mockParamData, mockAddress],
      communicateHelper,
      ...baseSignParams,
    })
    expect(result).toBe(mockResultSendRequest)
  })

  test("should return a valid signature for a correct non-hex message", async () => {
    const result = await personalSign({
      params: ["message" as Hex, mockAddress],
      communicateHelper,
      ...baseSignParams,
    })
    expect(result).toBe(mockResultSendRequest)
  })
})
