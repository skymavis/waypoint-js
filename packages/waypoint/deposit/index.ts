import { v4 as uuidv4 } from "uuid"

import { CommunicateHelper } from "../common/communicate"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "../common/gate"
import { buildUrlWithQuery, openPopup } from "../common/popup"

type DepositServiceMode = "compound-deposit" | "ronin-deposit" | "onramper"
type OnlyCryptoNetworks = "ronin" | "ethereum" | "bsc" | "polygon" | "arbitrum" | "base" | "solana"

type OnramperBaseProps = {
  references?: {
    swapAction?: string
  }
  redirectAtCheckout?: boolean
}

type DepositServiceConfigMap = {
  [K in DepositServiceMode]: K extends "ronin-deposit"
    ? Record<never, never>
    : { onramperOptions?: OnramperBaseProps }
}

export type DepositConfig<T extends DepositServiceMode> = {
  clientId: string
  waypointOrigin?: string
  origin?: string
  redirectUri: string
  environment?: "development" | "production"
  theme?: "light" | "dark"
} & {
  [K in T]: { mode?: K } & DepositServiceConfigMap[K]
}[T]

type OrderSuccessMessage = {
  provider: string
  transaction_hash: string
  fiat_currency: string
  crypto_currency: string
  fiat_amount: number
  crypto_amount: number
}

type OnramperStartParams = {
  networkWallets?: {
    [key in OnlyCryptoNetworks]?: string
  }
}

type RoninDepositStartParams = {
  walletAddress?: string
}

type StartDepositParamMap = {
  [K in DepositServiceMode]: K extends "ronin-deposit"
    ? {
        roninDepositParams?: RoninDepositStartParams
      }
    : K extends "onramper"
      ? {
          onramperParams?: OnramperStartParams
        }
      : {
          roninDepositParams?: RoninDepositStartParams
          onramperParams?: OnramperStartParams
        }
}

type StartDepositParams<T extends DepositServiceMode> = StartDepositParamMap[T] & {
  email?: string
  walletAddress?: string
  fiatCurrency?: string
  fiatAmount?: number
  cryptoCurrency?: string
}

const DEPOSIT_POPUP_WIDTH = 500
const DEPOSIT_POPUP_HEIGHT = 770

export class Deposit<T extends DepositServiceMode> {
  private readonly mode: T
  private readonly onramperOptions?: OnramperBaseProps
  private readonly clientId: string
  private readonly waypointOrigin: string
  private readonly redirectUri: string
  private readonly origin: string
  private readonly environment?: string
  private readonly theme?: string
  private communicateHelper?: CommunicateHelper

  constructor(config: DepositConfig<T>) {
    const {
      waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
      redirectUri,
      origin = typeof window !== "undefined" ? window.location.origin : "",
      clientId,
      environment,
      theme,
      mode = "compound-deposit",
    } = config

    this.waypointOrigin = waypointOrigin
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.environment = environment
    this.theme = theme
    this.origin = origin
    this.mode = mode as T
    this.onramperOptions = "onramperOptions" in config ? config.onramperOptions : undefined
  }

  private getDepositUrlBase(): string {
    return `${this.waypointOrigin}/client/${this.clientId}/deposit`
  }

  private getCommunicateHelper(): CommunicateHelper {
    if (this.communicateHelper) return this.communicateHelper
    this.communicateHelper = new CommunicateHelper(this.waypointOrigin)
    return this.communicateHelper
  }

  private buildQuery(state: string, params?: StartDepositParams<T>) {
    const { email, walletAddress, fiatCurrency, cryptoCurrency, fiatAmount } = params ?? {}
    const roninDepositParams =
      params && "roninDepositParams" in params ? params.roninDepositParams : undefined
    const onramperParams = params && "onramperParams" in params ? params.onramperParams : undefined

    return {
      state,
      email,
      environment: this.environment,
      theme: this.theme,
      origin: this.origin,
      redirect: this.redirectUri,
      wallet_address: walletAddress,
      fiat_currency: fiatCurrency,
      crypto_currency: cryptoCurrency,
      fiat_amount: fiatAmount,
      mode: this.mode,
      ronin_deposit_options: {
        ...roninDepositParams,
      },
      onramper_options: {
        ...onramperParams,
        ...this.onramperOptions,
      },
    }
  }

  start = async (params?: StartDepositParams<T>) => {
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

  dryRun = (params?: StartDepositParams<T>): string => {
    const state = uuidv4()
    const query = this.buildQuery(state, params)
    const url = buildUrlWithQuery(this.getDepositUrlBase(), query)
    return url.toString()
  }
}
