import { describe, expect, test } from "vitest"

import { normalizeWaypointError } from "../../common/waypoint-error"

describe("Normalize Waypoint Error", () => {
  test("return mapped detail error message", () => {
    const testCases: Array<{ input: { code: number; message: string }; detailMessage: string }> = [
      {
        input: { code: 1000, message: "User rejected" },
        detailMessage: "user reject action on Ronin Waypoint",
      },
      {
        input: { code: 1001, message: "Missing message or typedData" },
        detailMessage: "sign data is NOT valid",
      },
      {
        input: { code: 1003, message: "Invalid payload" },
        detailMessage: "wallet payload is NOT valid",
      },
      {
        input: { code: 1004, message: "Invalid payload" },
        detailMessage: "authorize payload is NOT valid",
      },
      {
        input: { code: 2001, message: "Can't get user address" },
        detailMessage: "id wallet is NOT define",
      },
      {
        input: { code: 3000, message: "Can't create the wallet" },
        detailMessage: "could NOT create wallet",
      },
      {
        input: { code: 4000, message: "Can't simulate contract request" },
        detailMessage: "transaction simulate fail",
      },
    ]

    testCases.forEach(({ input, detailMessage }) => {
      expect(normalizeWaypointError(input).details).toBe(detailMessage)
    })
  })

  test("return unknown detail error message", () => {
    const testCases: Array<{ input: { code: number; message: string }; detailMessage: string }> = [
      {
        input: { code: 2000, message: "Unknown error" },
        detailMessage: "unknown Ronin Waypoint error",
      },
      {
        input: { code: 30070, message: "Unknown error" },
        detailMessage: "unknown Ronin Waypoint error",
      },
      {
        input: { code: 50000, message: "Unknown error" },
        detailMessage: "unknown Ronin Waypoint error",
      },
    ]

    testCases.forEach(({ input, detailMessage }) => {
      expect(normalizeWaypointError(input).details).toBe(detailMessage)
    })
  })
})
