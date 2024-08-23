import {
  AutoConnectPriority,
  BaseConnector,
  ConnectorError,
  IConnectResult,
} from "@roninnetwork/walletgo"
import { RoninWaypointWallet } from "@sky-mavis/waypoint"

import { RoninLogo } from "./RoninLogo"

export const RONIN_WAYPOINT_URL = "https://waypoint.roninchain.com"
const STORAGE_KEY = "RONIN.WAYPOINT:ADDRESS"

export class RoninWaypointConnector extends BaseConnector<RoninWaypointWallet> {
  clientId: string
  idOrigin: string

  switchable: false
  scannable: false
  autoPriority = AutoConnectPriority.WalletConnect

  hidden = false

  provider?: RoninWaypointWallet

  constructor(clientId: string, idOrigin: string) {
    super(
      "RONIN_WAYPOINT_CONNECTOR",
      "Ronin Waypoint",
      { default: RONIN_WAYPOINT_URL, external: RONIN_WAYPOINT_URL },
      <RoninLogo />,
      false,
    )

    this.clientId = clientId
    this.idOrigin = idOrigin
  }

  async shouldAutoConnect(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  async connect(chainId: number): Promise<IConnectResult<RoninWaypointWallet>> {
    const newProvider = RoninWaypointWallet.create({
      idOrigin: this.idOrigin,
      clientId: this.clientId,
      chainId: chainId,
    })

    const accounts = await newProvider.request<string[]>({ method: "eth_requestAccounts" })

    if (accounts.length) {
      this.provider = newProvider

      return {
        account: accounts[0],
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
