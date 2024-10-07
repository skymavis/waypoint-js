import { Context, createContext } from "react"
import { WalletClient } from "viem"

type ContextValue = {
  requestWalletClient: () => void
  walletClient: WalletClient | undefined
}

type WalletContext = Context<ContextValue>

export const WalletContext: WalletContext = createContext<ContextValue>({
  requestWalletClient: () => {},
  walletClient: undefined,
})

WalletContext.displayName = "WalletContext"
