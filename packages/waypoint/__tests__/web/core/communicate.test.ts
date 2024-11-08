import { describe, expect, test, vi } from "vitest"

import { CommunicateHelper } from "../../../web/core/communicate"
import { CONFIG } from "../../constants"

vi.stubGlobal("open", vi.fn())

describe("CommunicateHelper", () => {
  test("Create CommunicateHelper", () => {
    const communicateHelper = new CommunicateHelper(CONFIG.WAYPOINT_ORIGIN)
    expect(communicateHelper).toBeDefined()
    expect(communicateHelper.handleResponse).toBeDefined()
    expect(communicateHelper.sendRequest).toBeDefined()
  })

  test("sendRequest with success test cases", () => {
    const successTestCases: Array<{
      input: string
      output: string | object
    }> = [
      {
        input: "sample string",
        output: "sample string",
      },
      {
        input: '{"id_token":"id_token"}',
        output: { id_token: "id_token" },
      },
      {
        input: '{"id_token":"id_token","address":"address"}',
        output: { id_token: "id_token", address: "address" },
      },
      {
        input:
          '{"id_token":"id_token","addressInfo":{"address":"address","secondary_address":"secondary_address"}}',
        output: {
          id_token: "id_token",
          addressInfo: {
            address: "address",
            secondary_address: "secondary_address",
          },
        },
      },
    ]

    successTestCases.forEach(async ({ input, output }) => {
      let requestId
      const communicateHelper = new CommunicateHelper(CONFIG.WAYPOINT_ORIGIN)
      const request = communicateHelper.sendRequest(state => {
        requestId = state
        return window
      })
      // Mock response from popup
      const message = new MessageEvent("message", {
        origin: CONFIG.WAYPOINT_ORIGIN,
        data: { type: "success", data: input, state: requestId },
      })
      window.dispatchEvent(message)

      const result = await request
      expect(result).toStrictEqual(output)
    })
  })

  test("sendRequest with fail test cases", () => {
    const failTestCases: Array<{
      input: { code: number; message?: string }
      output: string
    }> = [
      {
        input: { code: 1000, message: "User reject" },
        output: "user reject action on Ronin Waypoint",
      },
      {
        input: { code: 2000, message: "User reject" },
        output: "unknown Ronin Waypoint error",
      },
    ]

    failTestCases.forEach(async ({ input, output }) => {
      let requestId
      const communicateHelper = new CommunicateHelper(CONFIG.WAYPOINT_ORIGIN)
      const request = communicateHelper.sendRequest(state => {
        requestId = state
        return window
      })

      const message = new MessageEvent("message", {
        origin: CONFIG.WAYPOINT_ORIGIN,
        data: {
          type: "fail",
          error: input,
          state: requestId,
        },
      })
      window.dispatchEvent(message)

      try {
        await request
      } catch (error) {
        expect(error.details).toBe(output)
      }
    })
  })
})
