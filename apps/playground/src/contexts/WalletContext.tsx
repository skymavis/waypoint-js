"use client"

import {
  createRoninWallets,
  SupportedChainIds,
  WalletgoProvider,
  WalletWidget,
} from "@roninnetwork/walletgo"
import { useAtomValue } from "jotai"
import { createContext, FC, ReactNode, useCallback, useState } from "react"
import { environmentConfigAtom } from "src/atom/env-config"
import { WaypointConnector } from "src/connectors/WaypointConnector"
import { WaypointHybridConnector } from "src/connectors/WaypointHybridConnector"

export const EXPLORER_DOMAIN = "https://saigon-app.roninchain.com"
export const EXPLORER_CDN_URL = "https://cdn.skymavis.com/explorer-cdn"
const WC_PROJECT_ID = "d2ef97836db7eb390bcb2c1e9847ecdc"

interface IDialogContext {
  open: boolean
  setOpen: (value: boolean) => void
}

export const WalletgoDialogContext = createContext<IDialogContext>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  setOpen: (value: boolean) => {},
})

const DEFAULT_WALLETS = createRoninWallets({
  projectId: WC_PROJECT_ID,
  clientMeta: {
    name: "Ronin Waypoint Playground",
    description: "Ronin Waypoint Playground",
    icons: [`${EXPLORER_CDN_URL}/asset/favicon/apple-touch-icon.png`],
    url: EXPLORER_DOMAIN,
    redirect: {
      universal: EXPLORER_DOMAIN,
    },
  },
  ethereumWallets: true,
  noInjected: true,
  noGnosisSafe: true,
})

interface IProviderProps {
  children: ReactNode
}

export const WalletContext: FC<IProviderProps> = ({ children }) => {
  const { clientId, waypointOrigin, env } = useAtomValue(environmentConfigAtom)

  const waypointConnector = new WaypointConnector(clientId, waypointOrigin)
  const waypointHybridConnector = new WaypointHybridConnector(clientId, waypointOrigin, env)
  const wallets =
    env === "prod"
      ? [waypointConnector, ...DEFAULT_WALLETS]
      : [waypointHybridConnector, waypointConnector, ...DEFAULT_WALLETS]

  const [open, setOpen] = useState(false)
  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <WalletgoProvider defaultChainId={SupportedChainIds.RoninTestnet}>
      <WalletgoDialogContext.Provider value={{ open, setOpen }}>
        <WalletWidget wallets={wallets} isOpen={open} onOpen={handleOpen} onClose={handleClose} />
        {children}
      </WalletgoDialogContext.Provider>
    </WalletgoProvider>
  )
}
