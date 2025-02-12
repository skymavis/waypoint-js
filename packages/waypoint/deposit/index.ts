import { CommunicateHelper } from "../common/communicate"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "../common/gate"
import { openPopup } from "../common/popup"

export type DepositConfig = {
  clientId: string
  waypointOrigin?: string
  redirectUri?: string
  environment?: "development" | "production"
  theme?: "light" | "dark"
}

type OrderSuccessMessage = {
  provider: string
  transaction_hash: string
  fiat_currency: string
  crypto_currency: string
  fiat_amount: number
  crypto_amount: number
}

type StartDepositParams = {
  email?: string
  walletAddress?: string
  fiatCurrency?: string
  fiatAmount?: number
  cryptoCurrency?: string
}

const DEPOSIT_POPUP_WIDTH = 500
const DEPOSIT_POPUP_HEIGHT = 728

export class Deposit {
  private readonly clientId: string
  private readonly waypointOrigin: string
  private readonly redirectUri: string
  private readonly environment?: string
  private readonly theme?: string
  private readonly communicateHelper: CommunicateHelper

  constructor(config: DepositConfig) {
    const {
      waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
      redirectUri = typeof window !== "undefined" ? window.location.origin : "",
      clientId,
      environment,
      theme,
    } = config

    this.waypointOrigin = waypointOrigin
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.environment = environment
    this.theme = theme
    this.communicateHelper = new CommunicateHelper(waypointOrigin)
  }

  start = async (params?: StartDepositParams) => {
    const response = await this.communicateHelper.sendRequest<OrderSuccessMessage>(state => {
      const { email, walletAddress, fiatCurrency, cryptoCurrency, fiatAmount } = params ?? {}

      const query = {
        state,
        email,
        environment: this.environment,
        theme: this.theme,
        origin: this.redirectUri,
        redirect_uri: this.redirectUri,
        wallet_address: walletAddress,
        fiat_currency: fiatCurrency,
        crypto_currency: cryptoCurrency,
        fiat_amount: fiatAmount,
      }

      const popupConfig = {
        width: DEPOSIT_POPUP_WIDTH,
        height: DEPOSIT_POPUP_HEIGHT,
      }

      return openPopup(`${this.waypointOrigin}/client/${this.clientId}/deposit`, query, popupConfig)
    })

    return {
      provider: response.provider,
      transactionHash: response.transaction_hash,
      fiatCurrency: response.fiat_currency,
      cryptoCurrency: response.crypto_currency,
      fiatAmount: response.fiat_amount,
      cryptoAmount: response.crypto_amount,
    }
  }
}
