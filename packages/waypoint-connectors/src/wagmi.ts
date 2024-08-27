import {
  WaypointProvider,
  WaypointProviderOpts,
  VIEM_CHAIN_MAPPING,
} from "@sky-mavis/waypoint"
import { createConnector } from "@wagmi/core"
import { ronin } from "@wagmi/core/chains"
import { Address, getAddress } from "viem"

const supportedChainIds = Object.values(VIEM_CHAIN_MAPPING).map(chain => chain.id)

createWagmiConnector.type = "roninWaypointWallet" as const

export function createWagmiConnector(parameters: WaypointProviderOpts) {
  let _provider: WaypointProvider | undefined

  return createConnector<WaypointProvider>(config => {
    function getSupportedChain(chainId?: number) {
      const targetChainId = chainId ?? parameters.chainId
      return (
        config.chains.find(
          chain => chain.id === targetChainId && supportedChainIds.includes(chain.id),
        ) ?? ronin
      )
    }

    return {
      id: "roninWaypointWallet",
      name: "Ronin Waypoint Wallet",
      icon: "https://cdn.skymavis.com/skymavis-home/public/favicon.ico",
      type: createWagmiConnector.type,

      async connect({ chainId } = {}) {
        const supportedChainId = getSupportedChain(chainId).id
        const provider = await this.getProvider({ chainId: supportedChainId })
        const accounts = await provider.request<Address[]>({ method: "eth_requestAccounts" })

        provider.on("accountsChanged", this.onAccountsChanged)
        provider.on("chainChanged", this.onChainChanged)
        provider.on("disconnect", this.onDisconnect)

        return {
          accounts,
          chainId: supportedChainId,
        }
      },

      async disconnect() {
        const provider = await this.getProvider()
        provider.disconnect()
        _provider = undefined
        provider.removeListener("accountsChanged", this.onAccountsChanged)
        provider.removeListener("chainChanged", this.onChainChanged)
        provider.removeListener("disconnect", this.onDisconnect)
      },

      async getProvider({ chainId } = {}) {
        if (!_provider) {
          const provider = WaypointProvider.create({
            ...parameters,
            chainId: getSupportedChain(chainId).id,
          })
          _provider = provider
        }
        return _provider
      },

      async getAccounts() {
        const provider = await this.getProvider()
        return (
          await provider.request<Address[]>({
            method: "eth_accounts",
          })
        ).map(x => getAddress(x))
      },

      async getChainId() {
        const provider = await this.getProvider()
        return provider.chainId
      },

      async isAuthorized() {
        try {
          const accounts = await this.getAccounts()
          return !!accounts.length
        } catch {
          return false
        }
      },

      onAccountsChanged(accounts) {
        if (accounts.length === 0) config.emitter.emit("disconnect")
        else
          config.emitter.emit("change", {
            accounts: accounts.map(x => getAddress(x)),
          })
      },

      onChainChanged(chain) {
        const chainId = Number(chain)
        config.emitter.emit("change", { chainId })
      },

      onDisconnect() {
        config.emitter.emit("disconnect")
      },
    }
  })
}
