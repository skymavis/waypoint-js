import { v4 as uuidv4 } from "uuid"

import { CommunicateHelper } from "../common/communicate"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "../common/gate"
import { buildUrlWithQuery, openPopup } from "../common/popup"

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

  private getDepositUrlBase(): string {
    return `${this.waypointOrigin}/client/${this.clientId}/deposit`
  }

  private buildQuery(state: string, params?: StartDepositParams) {
    const { email, walletAddress, fiatCurrency, cryptoCurrency, fiatAmount } = params ?? {}
    return {
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
  }

  start = async (params?: StartDepositParams) => {
    const response = await this.communicateHelper.sendRequest<OrderSuccessMessage>(state => {
      const query = this.buildQuery(state, params)

      const popupConfig = {
        width: DEPOSIT_POPUP_WIDTH,
        height: DEPOSIT_POPUP_HEIGHT,
      }

      return openPopup(this.getDepositUrlBase(), query, popupConfig)
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

  dryRun = (params?: StartDepositParams): string => {
    const state = uuidv4()
    const query = this.buildQuery(state, params)
    const url = buildUrlWithQuery(this.getDepositUrlBase(), query)
    return url.toString()
  }
}
