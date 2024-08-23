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
import { Eip1193EventName, Eip1193Provider, RoninWaypointRequestSchema } from "./common/eip1193"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "./common/gate"
import { IdResponse } from "./common/id-response"
import { getScopesParams, Scope } from "./common/scope"
import { CommunicateHelper } from "./core/communicate"
import { personalSign } from "./core/personal-sign"
import { sendTransaction } from "./core/send-tx"
import { signTypedDataV4 } from "./core/sign-data"
import { openPopup } from "./utils/popup"
import { getStorage, removeStorage, setStorage, STORAGE_ADDRESS_KEY } from "./utils/storage"
import { validateIdAddress } from "./utils/validate-address"

export type RoninWaypointWalletOpts = AuthorizeOpts & {
  chainId: number
}

/**
 * A JavaScript Ethereum Provider API for consistency across clients and applications.
 *
 * This provider is designed to easily integrate with Ronin Waypoint.
 *
 * Use `create` function to create a new instance.
 *
 * @example
 * import { RoninWaypointWallet } from "@sky-mavis/waypoint"
 *
 * const idWalletProvider = RoninWaypointWallet.create({
 *  clientId: "YOUR_CLIENT_ID",
 *  chainId: ronin.chainId,
 * })
 */
export class RoninWaypointWallet extends EventEmitter implements Eip1193Provider {
  private readonly clientId: string
  private readonly idOrigin: string
  private readonly redirectUrl: string
  private readonly scopes: Scope[]

  readonly chainId: number
  private address?: Address

  private readonly viemClient: Client
  private readonly communicateHelper: CommunicateHelper

  protected constructor(options: RoninWaypointWalletOpts) {
    super()

    const {
      clientId,
      chainId,
      scopes = [],
      idOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
      redirectUrl = typeof window !== "undefined" ? window.location.origin : "",
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

  /**
   * Creates a new RoninWaypointWallet instance.
   *
   * @param options Options for RoninWaypointWallet.
   *
   * @returns RoninWaypointWallet instance.
   *
   * @example
   * import { RoninWaypointWallet } from "@sky-mavis/waypoint"
   *
   * const idWalletProvider = RoninWaypointWallet.create({
   *  clientId: "YOUR_CLIENT_ID",
   *  chainId: ronin.chainId,
   * })
   */
  public static create = (options: RoninWaypointWalletOpts) => {
    return new RoninWaypointWallet(options)
  }

  private getIdAddress = () => {
    if (this.address) return this.address

    const storedAddress = getStorage(STORAGE_ADDRESS_KEY) || ""
    return validateIdAddress(storedAddress)
  }

  private getIdAddressOrConnect = async () => {
    const address = this.getIdAddress()
    if (address) return address

    const result = await this.connect()
    return result.address
  }

  /**
   * Connects to Ronin Waypoint provider and retrieves authorization data & user wallet address.
   *
   * @returns The access token and address.
   */
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
      const err = new Error("Ronin Waypoint do NOT return valid address")
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

  /**
   * Disconnect from Ronin Waypoint provider and clear the cached address in localStorage.
   */
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

  /**
   * A JavaScript Ethereum Provider API for consistency across clients and applications.
   *
   * Makes an Ethereum RPC method call.
   *
   * https://eips.ethereum.org/EIPS/eip-1193
   */
  request = async <ReturnType = unknown>(args: EIP1193Parameters<RoninWaypointRequestSchema>) => {
    const {
      clientId,
      idOrigin,
      communicateHelper,
      chainId,
      viemClient,
      connect,
      getIdAddress,
      getIdAddressOrConnect,
    } = this
    const { method, params } = args

    switch (method) {
      case "eth_chainId":
        return toHex(chainId) as ReturnType

      case "eth_accounts": {
        const address = getIdAddress()
        const result = address ? [address] : []
        return result as ReturnType
      }

      // * Ronin Waypoint is not like other providers, it need open popup to authorize & get address
      // * eth_requestAccounts should NOT get address from localStorage cache
      // * if user change address in Ronin Waypoint, it should get new address
      case "eth_requestAccounts": {
        const { address: newAddress } = await connect()
        return [newAddress] as ReturnType
      }

      case "personal_sign": {
        const expectAddress = await getIdAddressOrConnect()

        return personalSign({
          params,
          expectAddress,
          clientId,
          idOrigin,
          communicateHelper,
        }) as ReturnType
      }

      case "eth_signTypedData_v4": {
        const expectAddress = await getIdAddressOrConnect()

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
        const expectAddress = await getIdAddressOrConnect()

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
