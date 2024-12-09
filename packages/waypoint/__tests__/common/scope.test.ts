import { describe, expect, test } from "vitest"

import { getScopesParams, Scope } from "../../common/scope"

describe("getScopesParams", () => {
  test("returns multiple scopes as a space-separated string", () => {
    const testCases: Array<{ input: Scope[]; output: string }> = [
      {
        input: ["openid", "profile", "email", "wallet"],
        output: "openid profile email wallet",
      },
      {
        input: [],
        output: "",
      },
      {
        input: ["email", "email", "email"],
        output: "email email email", // each scope should be unique
      },
      {
        input: ["openid", "email"],
        output: "openid email",
      },
      {
        input: ["email", "openid"],
        output: "email openid",
      },
    ]

    testCases.forEach(({ input, output }) => {
      return expect(getScopesParams(input)).toBe(output)
    })
  })

  test("returns undefined when no scopes are provided", () => {
    expect(getScopesParams(undefined)).toBeUndefined()
  })
})
