export function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`
}

export enum SupportedChainIds {
  Ethereum = 1,
  Goerli = 5,
  RoninMainnet = 2020,
  RoninTestnet = 2021,
}

type IRpcConfig = Record<number, string>

const DEFAULT_RPC_CONFIG: IRpcConfig = {
  [SupportedChainIds.RoninMainnet]: "https://api.roninchain.com/rpc",
  [SupportedChainIds.RoninTestnet]: "https://saigon-testnet.roninchain.com/rpc",
}

export interface IChainInfo {
  chainId: number
  blockExplorerUrl?: string
  chainName: string
  iconUrl?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrl: string
}

export type IChainsConfig = Record<number, IChainInfo>

export const DEFAULT_CHAINS_CONFIG: IChainsConfig = {
  [SupportedChainIds.RoninMainnet]: {
    chainId: SupportedChainIds.RoninMainnet,
    blockExplorerUrl: "https://app.roninchain.com",
    chainName: "Ronin Mainnet",
    iconUrl: "https://cdn.skymavis.com/explorer-cdn/asset/favicon/apple-touch-icon.png",
    nativeCurrency: {
      name: "Ronin",
      symbol: "RON",
      decimals: 18,
    },
    rpcUrl: DEFAULT_RPC_CONFIG[SupportedChainIds.RoninMainnet],
  },

  [SupportedChainIds.RoninTestnet]: {
    chainId: SupportedChainIds.RoninTestnet,
    blockExplorerUrl: "https://saigon-app.roninchain.com",
    chainName: "Saigon Testnet",
    iconUrl: "https://cdn.skymavis.com/explorer-cdn/asset/favicon/apple-touch-icon.png",
    nativeCurrency: {
      name: "tRonin",
      symbol: "tRON",
      decimals: 18,
    },
    rpcUrl: DEFAULT_RPC_CONFIG[SupportedChainIds.RoninTestnet],
  },
}
