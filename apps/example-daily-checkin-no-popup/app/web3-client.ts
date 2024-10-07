import { createPublicClient, http } from "viem"
import { saigon } from "viem/chains"

export const web3PublicClient = createPublicClient({
  transport: http(),
  chain: saigon,
})
