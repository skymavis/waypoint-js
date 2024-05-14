import { EventEmitter } from "events"
import { jwtDecode } from "jwt-decode"
import { Chain, Client, createClient, http, toHex } from "viem"
import { goerli, mainnet, ronin, saigon } from "viem/chains"

import { CommunicateHelper } from "./common/communicate-helper"
import { IEip1193Provider, IEip1193RequestArgs } from "./common/eip1193"
import { EIP1193Event } from "./common/eip1193-event"
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from "./common/error"
import { GATE_ORIGIN_PROD } from "./common/gate"
import { Profile, RawProfile } from "./common/profile"
import { getStorage, removeStorage, setStorage, STORAGE_PROFILE_KEY } from "./common/storage"
import { personalSign } from "./personalSign"
import { sendTransaction } from "./sendTransaction"
import { signTypedDataV4 } from "./signTypedDataV4"
import { convertToZeroAddress } from "./utils/address"
import { openPopup } from "./utils/popup"
import type { Requires } from "./utils/types"

export type MavisIdProviderSetupOptions = {
  clientId: string
  chainId: number
  redirectUri?: string
  gateOrigin?: string
  rpcUrl?: string
}

const VIEM_CHAIN_MAPPING: Record<number, Chain> = {
  [ronin.id]: ronin,
  [saigon.id]: saigon,
  [mainnet.id]: mainnet,
  [goerli.id]: goerli,
}

// TODO: Support both postMessage & redirect
// TODO: Add redirect config true or false
export class MavisIdProvider extends EventEmitter implements IEip1193Provider {
  readonly clientId: string
  readonly gateOrigin: string
  readonly chainId: number
  readonly redirectUri?: string
  private profile?: Profile
  private mpcAddress?: string
  private viemClient: Client
  private readonly communicateHelper: CommunicateHelper

  protected constructor(
    options: Requires<MavisIdProviderSetupOptions, "chainId" | "gateOrigin" | "rpcUrl">,
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

  public static create = (options: MavisIdProviderSetupOptions) => {
    const {
      clientId,
      chainId,
      gateOrigin = GATE_ORIGIN_PROD,
      rpcUrl = VIEM_CHAIN_MAPPING[chainId].rpcUrls.default.http[0],
    } = options

    const provider = new MavisIdProvider({
      clientId,
      chainId,
      gateOrigin: gateOrigin,
      rpcUrl: rpcUrl,
    })

    provider.getProfile()

    return provider
  }

  private isLoggedIn = () => {
    return !!this.mpcAddress
  }

  private getProfile = () => {
    if (this.profile) return this.profile

    const profileJSON = getStorage(STORAGE_PROFILE_KEY)

    if (profileJSON) {
      const profile = JSON.parse(profileJSON) as Profile
      this.profile = profile
      this.mpcAddress = profile.mpcAddress
    }

    return undefined
  }

  private connect = async () => {
    const { gateOrigin, clientId } = this

    const authData = await this.communicateHelper.sendRequest<{
      id_token: string
      address: string
    }>(requestId =>
      openPopup(`${gateOrigin}/client/${clientId}/authorize`, {
        state: requestId,
        redirect: this.redirectUri ?? window.location.origin,
        origin: window.location.origin,
        scope: ["openid", "profile", "wallet", "email"].join(" "),
      }),
    )

    const { id_token: token, address } = authData

    const rawProfile = jwtDecode<RawProfile>(token)
    const profile: Profile = {
      sub: rawProfile.sub ?? "",
      name: rawProfile.name ?? "",
      email: rawProfile.email ?? "",
      avatar_url: rawProfile.avatar_url ?? "",
      mpcAddress: convertToZeroAddress(address),
    }

    this.profile = profile
    this.mpcAddress = profile.mpcAddress

    setStorage(STORAGE_PROFILE_KEY, JSON.stringify(profile))

    const addresses = [profile.mpcAddress]

    this.emit(EIP1193Event.ACCOUNTS_CHANGED, addresses)
    this.emit(EIP1193Event.CONNECT, { chainId: this.chainId })

    return addresses
  }

  private getAccounts = () => {
    this.getProfile()

    const address = this.mpcAddress

    return address ? [address] : []
  }

  private requestAccounts = async () => {
    const addresses = this.getAccounts()

    if (!addresses.length) return await this.connect()

    return addresses
  }

  disconnect = () => {
    const shouldEmitDisconnectEvent = this.isLoggedIn()

    removeStorage(STORAGE_PROFILE_KEY)
    this.profile = undefined
    this.mpcAddress = undefined

    if (shouldEmitDisconnectEvent) {
      this.emit(EIP1193Event.ACCOUNTS_CHANGED, [])
      this.emit(
        EIP1193Event.DISCONNECT,
        ProviderErrorCode.DISCONNECTED,
        "The provider is disconnected from all chains.",
      )
    }
  }

  private handleRequest = async <T = any>(args: IEip1193RequestArgs): Promise<T> => {
    const { method, params } = args

    switch (method) {
      case "eth_accounts": {
        return this.getAccounts() as T
      }

      case "eth_requestAccounts": {
        return (await this.requestAccounts()) as T
      }

      case "eth_chainId": {
        return toHex(this.chainId) as T
      }

      case "personal_sign": {
        if (!this.isLoggedIn())
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            "Unauthorized - call eth_requestAccounts first",
          )

        return personalSign({
          params,
          clientId: this.clientId,
          gateOrigin: this.gateOrigin,
          communicateHelper: this.communicateHelper,
        }) as T
      }

      case "eth_signTypedData":
      case "eth_signTypedData_v4": {
        if (!this.isLoggedIn())
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            "Unauthorized - call eth_requestAccounts first",
          )

        return signTypedDataV4({
          params,
          clientId: this.clientId,
          chainId: this.chainId,
          gateOrigin: this.gateOrigin,
          communicateHelper: this.communicateHelper,
        }) as T
      }

      case "eth_sendTransaction": {
        if (!this.isLoggedIn())
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            "Unauthorized - call eth_requestAccounts first",
          )

        return sendTransaction({
          params,
          clientId: this.clientId,
          gateOrigin: this.gateOrigin,
          chainId: this.chainId,
          communicateHelper: this.communicateHelper,
        }) as T
      }

      case "eth_sign": {
        throw new JsonRpcError(ProviderErrorCode.UNSUPPORTED_METHOD, "Method not supported")
      }

      default: {
        const result = (await this.viemClient.request(args as any)) as T

        return result
      }
    }
  }

  public async request<T = any>(args: IEip1193RequestArgs): Promise<T> {
    try {
      return this.handleRequest<T>(args)
    } catch (error: unknown) {
      if (error instanceof JsonRpcError) throw error

      if (error instanceof Error) throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, error.message)

      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, "Internal error")
    }
  }
}
