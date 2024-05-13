import { MavisIdProvider } from "@axieinfinity/mavis-id-sdk"
import {
  AutoConnectPriority,
  BaseConnector,
  ConnectorError,
  IConnectResult,
} from "@roninnetwork/walletgo"
import type { IAddEthereumChainParameter } from "@roninnetwork/walletgo/dist/types/common/eip3085"
import { ReactNode } from "react"

import { MavisLogo } from "./MavisLogo"

export const ID_URL = "https://id.skymavis.com"
const STORAGE_KEY = "MAVIS.ID:PROFILE"

class IdConnector extends BaseConnector<MavisIdProvider> {
  switchable: false
  scannable: false
  autoPriority = AutoConnectPriority.WalletConnect

  hidden = false

  provider?: MavisIdProvider

  constructor(logo: ReactNode) {
    super("MAVIS_ID_CONNECTOR", "Mavis ID", { default: ID_URL, external: ID_URL }, logo, false)
  }

  async shouldAutoConnect(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  async connect(chainId: number): Promise<IConnectResult<MavisIdProvider>> {
    const newProvider = MavisIdProvider.create({
      clientId: "xdemo",
      chainId: chainId,
    })

    const accounts = await newProvider.request({ method: "eth_requestAccounts" })

    if (accounts.length) {
      this.provider = newProvider

      return {
        account: accounts[0],
        chainId: chainId,
        provider: newProvider,
      }
    }

    throw new ConnectorError("ConnectFail", "Could not connect to ID")
  }

  async disconnect(): Promise<boolean> {
    if (this.provider) {
      this.provider.disconnect()
    }

    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  switchChain(chain: IAddEthereumChainParameter): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
}

export const idConnectorImpl = new IdConnector(<MavisLogo />)
