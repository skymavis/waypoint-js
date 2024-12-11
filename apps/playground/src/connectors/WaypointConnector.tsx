import {
  AutoConnectPriority,
  BaseConnector,
  ConnectorError,
  IConnectResult,
} from "@roninnetwork/walletgo"
import { WaypointProvider } from "@sky-mavis/waypoint"

import { RoninLogo } from "./RoninLogo"

const STORAGE_KEY = "RONIN.WAYPOINT:ADDRESS"
const RONIN_LOGO = <RoninLogo />

export class WaypointConnector extends BaseConnector<WaypointProvider> {
  clientId: string
  waypointOrigin: string

  switchable: false
  scannable: false
  autoPriority = AutoConnectPriority.WalletConnect

  hidden = false

  provider?: WaypointProvider

  constructor(clientId: string, waypointOrigin: string) {
    super(
      "RONIN_WAYPOINT_CONNECTOR",
      "Ronin Waypoint",
      { default: waypointOrigin, external: waypointOrigin },
      RONIN_LOGO,
      false,
    )

    this.clientId = clientId
    this.waypointOrigin = waypointOrigin
  }

  async shouldAutoConnect(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  async connect(chainId: number): Promise<IConnectResult<WaypointProvider>> {
    const newProvider = WaypointProvider.create({
      waypointOrigin: this.waypointOrigin,
      clientId: this.clientId,
      chainId: chainId,
    })

    const currentAccounts = await newProvider.request<string[]>({
      method: "eth_accounts",
    })

    if (currentAccounts.length) {
      this.provider = newProvider

      return {
        account: currentAccounts[0],
        chainId: chainId,
        provider: newProvider,
      }
    }
    const newAccounts = await newProvider.request<string[]>({
      method: "eth_requestAccounts",
    })

    if (newAccounts.length) {
      this.provider = newProvider

      return {
        account: newAccounts[0],
        chainId: chainId,
        provider: newProvider,
      }
    }

    throw new ConnectorError("ConnectFail", "Could not connect to Ronin Waypoint")
  }

  async disconnect(): Promise<boolean> {
    if (this.provider) {
      this.provider.disconnect()
    }

    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  switchChain(chain: unknown): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
}
