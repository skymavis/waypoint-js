import { createWagmiConnector } from "@sky-mavis/mavis-id-connectors"
import { createConfig, http } from "@wagmi/core"
import { ronin } from "viem/chains"

export const mavisIdWagmiConnector = createWagmiConnector({
  clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
  chainId: ronin.id,
})

export const config = createConfig({
  chains: [ronin],
  connectors: [mavisIdWagmiConnector],
  transports: {
    [ronin.id]: http(),
  },
})
