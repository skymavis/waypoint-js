import { createPublicClient, http } from "viem"

import { saigon } from "./chain"

export const web3PublicClient = createPublicClient({
  transport: http(),
  chain: saigon,
})
