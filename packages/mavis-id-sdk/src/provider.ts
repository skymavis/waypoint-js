import { EventEmitter } from "events"
import {
  Address,
  Client,
  createClient,
  EIP1193Parameters,
  http,
  ProviderDisconnectedError,
  toHex,
  UnauthorizedProviderError,
} from "viem"

import { VIEM_CHAIN_MAPPING } from "./common/chain"
import { Eip1193EventName, Eip1193Provider, MavisIdRequestSchema } from "./common/eip1193"
import { ID_ORIGIN_PROD } from "./common/gate"
import { IdResponse } from "./common/id-response"
import { CommunicateHelper } from "./core/communicate"
import { personalSign } from "./core/personal-sign"
import { sendTransaction } from "./core/send-tx"
import { signTypedDataV4 } from "./core/sign-data"
import { openPopup } from "./utils/popup"
import { getStorage, removeStorage, setStorage, STORAGE_ADDRESS_KEY } from "./utils/storage"
import type { Requires } from "./utils/types"
import { validateIdAddress } from "./utils/validate-address"

export type MavisIdProviderOpts = {
  clientId: string
  chainId: number
  redirectUri?: string
  gateOrigin?: string
  rpcUrl?: string
}

export class MavisIdProvider extends EventEmitter implements Eip1193Provider {
  private readonly clientId: string
  private readonly gateOrigin: string
  private readonly redirectUri?: string

  readonly chainId: number
  private address?: Address

  private readonly viemClient: Client
  private readonly communicateHelper: CommunicateHelper

  protected constructor(
    options: Requires<MavisIdProviderOpts, "chainId" | "gateOrigin" | "rpcUrl">,
  ) {
    super()

    const { clientId, chainId, gateOrigin, rpcUrl, redirectUri } = options

    this.clientId = clientId
    this.chainId = chainId
    this.gateOrigin = gateOrigin
    this.redirectUri = redirectUri

    this.viemClient = createClient({
      chain: VIEM_CHAIN_MAPPING[chainId],
      transport: http(rpcUrl),
    })

    this.communicateHelper = new CommunicateHelper(gateOrigin)
  }

  public static create = (options: MavisIdProviderOpts) => {
    const {
      clientId,
      chainId,
      gateOrigin = ID_ORIGIN_PROD,
      rpcUrl = VIEM_CHAIN_MAPPING[chainId].rpcUrls.default.http[0],
    } = options

    return new MavisIdProvider({
      clientId,
      chainId,
      gateOrigin: gateOrigin,
      rpcUrl: rpcUrl,
    })
  }

  private getIdAddress = () => {
    if (this.address) return this.address

    const storedAddress = getStorage(STORAGE_ADDRESS_KEY) || ""
    return validateIdAddress(storedAddress)
  }

  connect = async () => {
    const { gateOrigin, clientId } = this

    const authData = await this.communicateHelper.sendRequest<IdResponse>(requestId =>
      openPopup(`${gateOrigin}/client/${clientId}/authorize`, {
        state: requestId,
        redirect: this.redirectUri ?? window.location.origin,
        origin: window.location.origin,
        scope: ["openid", "profile", "wallet", "email"].join(" "),
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
    this.emit(Eip1193EventName.connect, { chainId: this.chainId })

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
    const { clientId, gateOrigin, communicateHelper, requestAccounts, chainId, getAccounts } = this
    const { method, params } = args

    switch (method) {
      case "eth_accounts":
        return getAccounts() as ReturnType

      case "eth_requestAccounts":
        return (await requestAccounts()) as ReturnType

      case "eth_chainId":
        return toHex(chainId) as ReturnType

      case "personal_sign": {
        const [expectAddress] = await requestAccounts()
        const sig = await personalSign({
          params,

          expectAddress,

          clientId,
          gateOrigin,
          communicateHelper,
        })

        return sig as ReturnType
      }

      case "eth_signTypedData_v4": {
        const [expectAddress] = await requestAccounts()

        const sig = await signTypedDataV4({
          params,

          chainId,
          expectAddress,

          clientId,
          gateOrigin,
          communicateHelper,
        })

        return sig as ReturnType
      }

      case "eth_sendTransaction": {
        const [expectAddress] = await requestAccounts()

        return sendTransaction({
          params,

          chainId,
          expectAddress,

          clientId,
          gateOrigin,
          communicateHelper,
        }) as ReturnType
      }

      default: {
        const result = await this.viemClient.request(args)

        return result as ReturnType
      }
    }
  }
}
