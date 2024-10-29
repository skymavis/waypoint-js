import { RONIN_WAYPOINT_ORIGIN_PROD } from "../web/common/gate"
import { CommunicateHelper } from "../web/core/communicate"
import { openPopup } from "../web/utils/popup"

export type DepositConfig = {
  waypointOrigin?: string
  clientId: string
  redirectUri?: string
}

type OrderSuccessMessage = {
  provider: string
  transactionHash: string
  fiatCurrency: string
  cryptoCurrency: string
  fiatAmount: number
  cryptoAmount: number
}

type OrderFailedMessage = {
  provider: string
  reason: string
}

type StartDepositParams = {
  walletAddress?: string
  fiatCurrency?: string
  cryptoCurrency?: string
}

export class Deposit {
  private readonly clientId: string
  private readonly waypointOrigin: string
  private readonly redirectUri: string
  private readonly communicateHelper: CommunicateHelper

  constructor(config: DepositConfig) {
    const {
      waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
      redirectUri = window.location.origin,
      clientId,
    } = config
    this.waypointOrigin = waypointOrigin
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.communicateHelper = new CommunicateHelper(waypointOrigin)
  }

  start = async (params?: StartDepositParams) => {
    return this.communicateHelper.sendRequest<OrderSuccessMessage | OrderFailedMessage>(state => {
      const { walletAddress, fiatCurrency, cryptoCurrency } = params ?? {}
      return openPopup(`${this.waypointOrigin}/client/${this.clientId}/deposit`, {
        state,
        origin: this.redirectUri,
        redirect_uri: this.redirectUri,
        wallet_address: walletAddress,
        fiat_currency: fiatCurrency,
        crypto_currency: cryptoCurrency,
      })
    })
  }
}
