import { useContext } from "react"

import { WalletContext } from "../contexts/wallet-context"

export const useWallet = () => useContext(WalletContext)
