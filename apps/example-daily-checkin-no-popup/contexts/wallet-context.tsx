import { Context, createContext } from "react"
import { Address, WalletClient } from "viem"

type ContextValue = {
  address: Address | undefined
  email: string | undefined

  requestWalletClient: () => void
  walletClient: WalletClient | undefined
}

type WalletContext = Context<ContextValue>

// * WHY: make whole application have abilities to access to walletClient
// * WHY: if wallet is not unlock, requestWalletClient function will do it
export const WalletContext: WalletContext = createContext<ContextValue>({
  address: undefined,
  email: undefined,

  requestWalletClient: () => {},
  walletClient: undefined,
})

WalletContext.displayName = "WalletContext"
