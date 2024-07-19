import { MavisIdWallet } from "@sky-mavis/mavis-id-sdk"
import { createPublicClient, createWalletClient, custom, http } from "viem"
import { saigon } from "viem/chains"

const idWalletProvider = MavisIdWallet.create({
  chainId: saigon.id,
  // clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",

  idOrigin: "https://id.skymavis.one",
  clientId: "5cf4daa9-e7ff-478b-a96c-1a9d46c916ca",
})

export const web3WalletClient = createWalletClient({
  transport: custom(idWalletProvider),
  chain: saigon,
})

export const web3PublicClient = createPublicClient({
  transport: http(),
  chain: saigon,
})
