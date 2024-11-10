import { describe, expect, test } from "vitest"

import { RONIN_WAYPOINT_ORIGIN_PROD } from "./../../../web/common/gate"

describe("RONIN_WAYPOINT_ORIGIN_PROD", () => {
  test("should have the correct value", () => {
    expect(RONIN_WAYPOINT_ORIGIN_PROD).toBe("https://waypoint.roninchain.com")
  })
})
