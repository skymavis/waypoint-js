import { useContext } from "react"

import { WalletContext } from "./wallet-context"

export const useWalletClient = () => useContext(WalletContext)
