import { describe, expect, test } from "vitest"

import { Eip1193EventName } from "../../../web/common/eip1193"

describe("Eip1193EventName Enum", () => {
  test("should have the correct values", () => {
    expect(Eip1193EventName.accountsChanged).toBe("accountsChanged")
    expect(Eip1193EventName.chainChanged).toBe("chainChanged")
    expect(Eip1193EventName.connect).toBe("connect")
    expect(Eip1193EventName.disconnect).toBe("disconnect")
    expect(Eip1193EventName.message).toBe("message")
  })

  test("should contain all expected keys", () => {
    const keys = Object.keys(Eip1193EventName)
    expect(keys).toContain("accountsChanged")
    expect(keys).toContain("chainChanged")
    expect(keys).toContain("connect")
    expect(keys).toContain("disconnect")
    expect(keys).toContain("message")
  })
})
