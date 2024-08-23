import type { Chain } from "viem"
import { goerli, mainnet, ronin, saigon } from "viem/chains"

export const VIEM_CHAIN_MAPPING: Record<number, Chain> = {
  [ronin.id]: ronin,
  [saigon.id]: saigon,
  [mainnet.id]: mainnet,
  [goerli.id]: goerli,
}
