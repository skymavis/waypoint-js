import { Hex, InternalRpcError, InvalidParamsRpcError, UnauthorizedProviderError } from "viem"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../../web/core/communicate"
import { normalizeIdError } from "../../../web/utils/error"
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

  test("should throw UnauthorizedProviderError if the address does not match expectAddress", async () => {
    await expect(
      personalSign({
        params: [mockParamData, "0x1111111111111111111111111111111111111111"],
        communicateHelper: communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrow(UnauthorizedProviderError)
  })

  test("should throw InvalidParamsRpcError if the data is empty", async () => {
    await expect(
      personalSign({
        params: ["" as Hex, mockAddress],
        communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrow(InvalidParamsRpcError)
  })

  test("should throw InternalRpcError if the signature is not a valid hex", async () => {
    // overwrite sendRequest resolved value
    vi.spyOn(communicateHelper, "sendRequest").mockResolvedValue("000")

    await expect(
      personalSign({
        params: [mockParamData, mockAddress],
        communicateHelper,
        ...baseSignParams,
      }),
    ).rejects.toThrowError(InternalRpcError)
  })
  test("should throw RpcError if the sendRequest got user reject", async () => {
    // overwrite sendRequest rejected value
    vi.spyOn(communicateHelper, "sendRequest").mockRejectedValue(
      normalizeIdError({ code: 1000, message: "User reject" }),
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
