import { Lockbox, LockboxProvider, WASM_DEV_CDN_URL } from "@axieinfinity/lockbox"
import {
  AutoConnectPriority,
  BaseConnector,
  ConnectorError,
  IConnectResult,
} from "@roninnetwork/walletgo"
import { ReactNode } from "react"
import { Address } from "viem"

import { MavisLogo } from "./MavisLogo"

export const LOCKBOX_ACCESS_TOKEN_KEY = "LOCKBOX.GG_ACCESS_TOKEN"

export const lockbox = Lockbox.init({
  chainId: 2021,
  serviceEnv: "stag",
  wasmUrl: WASM_DEV_CDN_URL,
})

export class LockboxConnector extends BaseConnector<LockboxProvider> {
  switchable: false
  scannable: false
  autoPriority: AutoConnectPriority.NotAuto

  hidden = false

  provider?: LockboxProvider

  constructor(logo: ReactNode) {
    super("lockbox-core", "Lockbox Core", { default: "https://id.skymavis.com" }, logo, false)
  }

  shouldAutoConnect(): Promise<boolean> {
    return Promise.resolve(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(chainId: number): Promise<IConnectResult<LockboxProvider>> {
    const newProvider = lockbox.getProvider()

    const accounts = await newProvider.request<Address[]>({
      method: "eth_requestAccounts",
    })

    if (accounts.length) {
      this.provider = newProvider

      return {
        account: accounts[0],
        chainId: 2021,
        provider: newProvider,
      }
    }

    throw new ConnectorError("ConnectFail", "Could not connect to Lockbox Core")
  }

  disconnect(): Promise<boolean> {
    // this.provider.disconnect()

    return Promise.resolve(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  switchChain(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
}

export const lockboxConnectorImpl = new LockboxConnector(<MavisLogo />)
