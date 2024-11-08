import { expect, test } from "vitest"

import { getScopesParams, Scope } from "../../../web/common/scope"

test("getScopesParams", () => {
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
    return expect(getScopesParams(input as Scope[])).toBe(output)
  })
})
