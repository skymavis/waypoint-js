import { goerli, mainnet, ronin, saigon, sepolia } from "viem/chains"
import { describe, expect, test } from "vitest"

import { VIEM_CHAIN_MAPPING } from "../../common/chain"

describe("VIEM_CHAIN_MAPPING", () => {
  test("should map the correct chain for ronin", () => {
    expect(VIEM_CHAIN_MAPPING[ronin.id]).toBe(ronin)
  })

  test("should map the correct chain for saigon", () => {
    expect(VIEM_CHAIN_MAPPING[saigon.id]).toBe(saigon)
  })

  test("should map the correct chain for mainnet", () => {
    expect(VIEM_CHAIN_MAPPING[mainnet.id]).toBe(mainnet)
  })

  test("should map the correct chain for goerli", () => {
    expect(VIEM_CHAIN_MAPPING[goerli.id]).toBe(goerli)
  })

  test("should map the correct chain for sepolia", () => {
    expect(VIEM_CHAIN_MAPPING[sepolia.id]).toBe(sepolia)
  })

  test("should map all expected chains", () => {
    const expectedChains = [ronin, saigon, mainnet, goerli, sepolia]
    expectedChains.forEach(chain => {
      expect(VIEM_CHAIN_MAPPING[chain.id]).toBe(chain)
    })
  })
})
