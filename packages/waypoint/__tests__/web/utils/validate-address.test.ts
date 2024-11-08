import { describe, expect, test } from "vitest"

import { validateIdAddress } from "../../../web/utils/validate-address"

describe("validateIdAddress", () => {
  test("should return undefined", () => {
    const testCases: Array<string | null | undefined> = [
      "0x12345",
      "true",
      undefined,
      null,
      "",
      "0x79CC456b4c115D5CC80Cb28e548058EbFD983c5",
      "0x79CC456b4c115D5CC80Cb28e548058EbFD983c577",
      "30x409e230c2F24db1ff119C3A4681aD884A38D646",
    ]

    testCases.forEach(inputAddress => {
      return expect(validateIdAddress(inputAddress)).toBeUndefined()
    })
  })

  test("should return valid address", () => {
    const testCases: Array<{ input: string | null | undefined; output: string | undefined }> = [
      {
        input: "0x79CC456b4c115D5CC80Cb28e548058EbFD983c56",
        output: "0x79CC456b4c115D5CC80Cb28e548058EbFD983c56",
      },
      {
        input: "0x0409e230c2F24db1ff119C3A4681aD884A38D646",
        output: "0x0409e230c2F24db1ff119C3A4681aD884A38D646",
      },
    ]

    testCases.forEach(({ input, output }) => {
      return expect(validateIdAddress(input)).toBe(output)
    })
  })
})
