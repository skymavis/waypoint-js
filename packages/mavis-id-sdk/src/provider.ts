import { EventEmitter } from "events"
import {
  Address,
  ChainDisconnectedError,
  Client,
  createClient,
  EIP1193Parameters,
  http,
  ProviderDisconnectedError,
  toHex,
  UnauthorizedProviderError,
} from "viem"

import { AuthorizeOpts } from "./auth"
import { VIEM_CHAIN_MAPPING } from "./common/chain"
import { Eip1193EventName, Eip1193Provider, MavisIdRequestSchema } from "./common/eip1193"
import { ID_ORIGIN_PROD } from "./common/gate"
import { IdResponse } from "./common/id-response"
import { getScopesParams, Scope } from "./common/scope"
import { CommunicateHelper } from "./core/communicate"
import { personalSign } from "./core/personal-sign"
import { sendTransaction } from "./core/send-tx"
import { signTypedDataV4 } from "./core/sign-data"
import { openPopup } from "./utils/popup"
import { getStorage, removeStorage, setStorage, STORAGE_ADDRESS_KEY } from "./utils/storage"
import { validateIdAddress } from "./utils/validate-address"

export type MavisIdWalletOpts = AuthorizeOpts & {
  chainId: number
}

export class MavisIdWallet extends EventEmitter implements Eip1193Provider {
  private readonly clientId: string
  private readonly idOrigin: string
  private readonly redirectUrl: string
  private readonly scopes: Scope[]

  readonly chainId: number
  private address?: Address

  private readonly viemClient: Client
  private readonly communicateHelper: CommunicateHelper

  protected constructor(options: MavisIdWalletOpts) {
    super()

    const {
      clientId,
      chainId,
      scopes = [],
      idOrigin = ID_ORIGIN_PROD,
      redirectUrl = window.location.origin,
    } = options

    this.clientId = clientId
    this.idOrigin = idOrigin
    this.redirectUrl = redirectUrl
    this.chainId = chainId
    this.scopes = this.addDefaultScopes(scopes)
    this.communicateHelper = new CommunicateHelper(idOrigin)
    this.viemClient = this.createViemClient(chainId)
  }

  private createViemClient(chainId: number) {
    const chain = VIEM_CHAIN_MAPPING[chainId]

    if (!chain) {
      const err = new Error(`Chain ${chainId} is not supported.`)
      throw new ChainDisconnectedError(err)
    }

    return createClient({
      chain: VIEM_CHAIN_MAPPING[chainId],
      transport: http(),
    })
  }

  private addDefaultScopes(scopes: Scope[]): Scope[] {
    const newScopes = [...scopes]

    if (!newScopes.includes("openid")) {
      newScopes.push("openid")
    }

    if (!newScopes.includes("wallet")) {
      newScopes.push("wallet")
    }

    return newScopes
  }

  public static create = (options: MavisIdWalletOpts) => {
    return new MavisIdWallet(options)
  }

  private getIdAddress = () => {
    if (this.address) return this.address

    const storedAddress = getStorage(STORAGE_ADDRESS_KEY) || ""
    return validateIdAddress(storedAddress)
  }

  connect = async () => {
    const { idOrigin, clientId, redirectUrl, scopes, communicateHelper, chainId } = this

    const authData = await communicateHelper.sendRequest<IdResponse>(state =>
      openPopup(`${idOrigin}/client/${clientId}/authorize`, {
        state,
        redirect: redirectUrl,
        origin: window.location.origin,
        scope: getScopesParams(scopes),
      }),
    )

    const { id_token: accessToken, address: rawAddress } = authData
    const address = validateIdAddress(rawAddress)

    if (!address) {
      const err = new Error("ID do NOT return valid address")
      throw new UnauthorizedProviderError(err)
    }

    // * set address in localstorage for reconnect & caching
    setStorage(STORAGE_ADDRESS_KEY, address)
    this.address = address

    // * emit connected event
    const addresses = [address]
    this.emit(Eip1193EventName.accountsChanged, addresses)
    this.emit(Eip1193EventName.connect, { chainId: chainId })

    return {
      accessToken,
      address,
    }
  }

  disconnect = () => {
    const shouldEmitDisconnectEvent = !!this.address

    removeStorage(STORAGE_ADDRESS_KEY)
    this.address = undefined

    if (shouldEmitDisconnectEvent) {
      const err = new Error("The provider is disconnected from all chains.")
      const providerErr = new ProviderDisconnectedError(err)

      this.emit(Eip1193EventName.accountsChanged, [])
      this.emit(Eip1193EventName.disconnect, providerErr)
    }
  }

  private getAccounts = () => {
    const address = this.getIdAddress()

    return address ? [address] : []
  }

  private requestAccounts = async () => {
    const addresses = this.getAccounts()
    if (addresses.length) return addresses

    const result = await this.connect()

    return [result.address]
  }

  request = async <ReturnType = unknown>(args: EIP1193Parameters<MavisIdRequestSchema>) => {
    const {
      clientId,
      idOrigin,
      communicateHelper,
      requestAccounts,
      chainId,
      getAccounts,
      viemClient,
    } = this
    const { method, params } = args

    switch (method) {
      case "eth_accounts":
        return getAccounts() as ReturnType

      case "eth_requestAccounts":
        return requestAccounts() as ReturnType

      case "eth_chainId":
        return toHex(chainId) as ReturnType

      case "personal_sign": {
        const [expectAddress] = await requestAccounts()
        return personalSign({
          params,
          expectAddress,
          clientId,
          idOrigin,
          communicateHelper,
        }) as ReturnType
      }

      case "eth_signTypedData_v4": {
        const [expectAddress] = await requestAccounts()
        return signTypedDataV4({
          params,
          chainId,
          expectAddress,
          clientId,
          idOrigin,
          communicateHelper,
        }) as ReturnType
      }

      case "eth_sendTransaction": {
        const [expectAddress] = await requestAccounts()
        return sendTransaction({
          params,
          chainId,
          expectAddress,
          clientId,
          idOrigin,
          communicateHelper,
        }) as ReturnType
      }

      default: {
        return viemClient.request(args) as ReturnType
      }
    }
  }
}
