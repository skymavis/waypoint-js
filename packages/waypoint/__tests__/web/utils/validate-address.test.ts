import { expect, test } from "vitest"

import { validateIdAddress } from "../../../web/utils/validate-address"

test("validateIdAddress", () => {
  const testCases: Array<{ input: string | null | undefined; output: string | undefined }> = [
    {
      input: "0x12345",
      output: undefined,
    },
    {
      input: "true",
      output: undefined,
    },
    {
      input: undefined,
      output: undefined,
    },
    {
      input: null,
      output: undefined,
    },
    {
      input: "",
      output: undefined,
    },
    {
      input: "0x79CC456b4c115D5CC80Cb28e548058EbFD983c56",
      output: "0x79CC456b4c115D5CC80Cb28e548058EbFD983c56",
    },
    {
      input: "0x79CC456b4c115D5CC80Cb28e548058EbFD983c5",
      output: undefined,
    },
    {
      input: "0x79CC456b4c115D5CC80Cb28e548058EbFD983c577",
      output: undefined,
    },
    {
      input: "30x409e230c2F24db1ff119C3A4681aD884A38D646",
      output: undefined,
    },
  ]

  testCases.forEach(({ input, output }) => {
    return expect(validateIdAddress(input)).toBe(output)
  })
})
