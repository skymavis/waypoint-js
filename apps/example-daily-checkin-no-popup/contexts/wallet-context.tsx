import { Context, createContext } from "react"
import { Address, CustomTransport, WalletClient } from "viem"

import { saigon } from "../common/chain"

type ContextValue = {
  address: Address | undefined
  email: string | undefined
  expiration: number | undefined

  requestWalletClient: () => void
  walletClient: WalletClient<CustomTransport, typeof saigon> | undefined
}

type WalletContext = Context<ContextValue>

// * WHY: make whole application have abilities to access to walletClient
// * WHY: if wallet is not unlock, requestWalletClient function will do it
export const WalletContext: WalletContext = createContext<ContextValue>({
  address: undefined,
  email: undefined,
  expiration: undefined,

  requestWalletClient: () => {},
  walletClient: undefined,
})

WalletContext.displayName = "WalletContext"
