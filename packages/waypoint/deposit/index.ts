import { v4 as uuidv4 } from "uuid"

import { CommunicateHelper } from "../common/communicate"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "../common/gate"
import { buildUrlWithQuery, openPopup } from "../common/popup"

type OnlyCryptoNetworks = "ronin" | "ethereum" | "bsc" | "polygon" | "arbitrum" | "base" | "solana"
type OnramperBaseProps = {
  references?: {
    swapAction?: string
  }
  redirectAtCheckout?: boolean
}

export type DepositConfig = {
  clientId: string
  waypointOrigin?: string
  origin?: string
  redirectUri: string
  environment?: "development" | "production"
  theme?: "light" | "dark"
  onramperOptions?: OnramperBaseProps
}

type OrderSuccessMessage = {
  provider: string
  transaction_hash: string
  fiat_currency: string
  crypto_currency: string
  fiat_amount: number
  crypto_amount: number
}

type Address = string

export type CryptoCurrency = {
  network: OnlyCryptoNetworks
  symbol: string
  address?: string
  chainId?: number
}

type OnramperStartParams = {
  networkWallets?: {
    [key in OnlyCryptoNetworks]?: Address
  }
}

type RoninDepositStartParams = {
  walletAddress?: string
}

export type StartDepositParams = {
  email?: string
  walletAddress?: string
  fiatCurrency?: string
  cryptoCurrency?: CryptoCurrency
  fiatAmount?: number
  onramperParams?: OnramperStartParams
  roninDepositParams?: RoninDepositStartParams
}

const DEPOSIT_POPUP_WIDTH = 500
const DEPOSIT_POPUP_HEIGHT = 790

export class Deposit {
  private readonly clientId: string
  private readonly waypointOrigin: string
  private readonly redirectUri: string
  private readonly origin?: string
  private readonly environment?: string
  private readonly theme?: string
  private communicateHelper?: CommunicateHelper
  private readonly onramperOptions?: OnramperBaseProps

  constructor(config: DepositConfig) {
    const {
      waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
      redirectUri,
      origin,
      clientId,
      environment,
      onramperOptions,
      theme,
    } = config

    this.waypointOrigin = waypointOrigin
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.environment = environment
    this.theme = theme
    this.origin = origin
    this.onramperOptions = onramperOptions
  }

  private getDepositUrlBase(): string {
    return `${this.waypointOrigin}/client/${this.clientId}/deposit`
  }

  private getCommunicateHelper(): CommunicateHelper {
    if (this.communicateHelper) return this.communicateHelper
    this.communicateHelper = new CommunicateHelper(this.waypointOrigin)
    return this.communicateHelper
  }

  private buildQuery(state: string, params?: StartDepositParams) {
    const {
      email,
      walletAddress,
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      roninDepositParams,
      onramperParams,
    } = params ?? {}

    return {
      state,
      email,
      environment: this.environment,
      theme: this.theme,
      origin: this.origin,
      redirect: this.redirectUri,
      wallet_address: walletAddress,
      fiat_currency: fiatCurrency,
      fiat_amount: fiatAmount,
      data: {
        roninDepositOptions: {
          ...roninDepositParams,
        },
        onramperOptions: {
          ...onramperParams,
          ...this.onramperOptions,
        },
        cryptoCurrency: cryptoCurrency,
      },
    }
  }

  start = async (params?: StartDepositParams) => {
    const response = await this.getCommunicateHelper().sendRequest<OrderSuccessMessage>(state => {
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
