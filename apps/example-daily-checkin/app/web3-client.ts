import { WaypointProvider } from "@sky-mavis/waypoint"
import { createPublicClient, createWalletClient, custom, http } from "viem"
import { saigon } from "viem/chains"

const idWalletProvider = WaypointProvider.create({
  chainId: saigon.id,
  clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
})

export const web3WalletClient = createWalletClient({
  transport: custom(idWalletProvider),
  chain: saigon,
})

export const web3PublicClient = createPublicClient({
  transport: http(),
  chain: saigon,
})
