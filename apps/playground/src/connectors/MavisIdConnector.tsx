import {
  AutoConnectPriority,
  BaseConnector,
  ConnectorError,
  IConnectResult,
} from "@roninnetwork/walletgo"
import { MavisIdWallet } from "@sky-mavis/mavis-id-sdk"

import { MavisLogo } from "./MavisLogo"

export const ID_URL = "https://id.skymavis.com"
const STORAGE_KEY = "MAVIS.ID:ADDRESS"

const mavisIdLogo = <MavisLogo />

export class MavisIdConnector extends BaseConnector<MavisIdWallet> {
  clientId: string
  idOrigin: string

  switchable: false
  scannable: false
  autoPriority = AutoConnectPriority.WalletConnect

  hidden = false

  provider?: MavisIdWallet

  constructor(clientId: string, idOrigin: string) {
    super(
      "MAVIS_ID_CONNECTOR",
      "Mavis ID",
      { default: ID_URL, external: ID_URL },
      mavisIdLogo,
      false,
    )

    this.clientId = clientId
    this.idOrigin = idOrigin
  }

  async shouldAutoConnect(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  async connect(chainId: number): Promise<IConnectResult<MavisIdWallet>> {
    const newProvider = MavisIdWallet.create({
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

    throw new ConnectorError("ConnectFail", "Could not connect to ID")
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
