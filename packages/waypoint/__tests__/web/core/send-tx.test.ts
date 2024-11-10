import { Hex, RpcError } from "viem"
import { describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../../web/core/communicate"
import { normalizeIdError } from "../../../web/utils/error"
import { sendTransaction } from "./../../../web/core/send-tx"
import { CONFIG } from "./../../constants"

describe("sendTransaction", () => {
  const communicateHelper = new CommunicateHelper(CONFIG.WAYPOINT_ORIGIN)

  test("should throw RpcError if the sendRequest got user reject", async () => {
    vi.spyOn(communicateHelper, "sendRequest").mockRejectedValue(
      normalizeIdError({ code: 1000, message: "User reject" }),
    )

    await expect(
      sendTransaction({
        chainId: CONFIG.CHAIN_ID,
        clientId: CONFIG.CLIENT_ID,
        waypointOrigin: CONFIG.WAYPOINT_ORIGIN,
        expectAddress: CONFIG.EXPECTED_ADDRESS as Hex,
        communicateHelper,
        params: [
          {
            to: CONFIG.EXPECTED_ADDRESS as Hex,
          },
        ],
      }),
    ).rejects.toThrow(RpcError)
  })

  test("should return transaction hash with valid transaction", async () => {
    const mockTransactionHash = "0xba50a14b98e3d9bc99b521fdebeb25c0cc315b62749ad86cbd8850f286a098cc"
    vi.spyOn(communicateHelper, "sendRequest").mockResolvedValue(mockTransactionHash)
    const transactionHash = await sendTransaction({
      chainId: CONFIG.CHAIN_ID,
      clientId: CONFIG.CLIENT_ID,
      waypointOrigin: CONFIG.WAYPOINT_ORIGIN,
      expectAddress: CONFIG.EXPECTED_ADDRESS as Hex,
      communicateHelper,
      params: [
        {
          to: CONFIG.EXPECTED_ADDRESS as Hex,
        },
      ],
    })

    expect(transactionHash).toBe(mockTransactionHash)
  })
})
