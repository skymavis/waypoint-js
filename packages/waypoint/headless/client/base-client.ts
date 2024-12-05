import {
  Address,
  type Client,
  createClient,
  http,
  isAddress,
  type SignableMessage,
  type TypedDataDefinition,
} from "viem"

import { VIEM_CHAIN_MAPPING } from "../../web"
import { backupShard } from "../action/backup-shard"
import { decryptShard } from "../action/decrypt-shard"
import { encryptShard } from "../action/encrypt-shard"
import { getAddressFromShard } from "../action/get-address"
import { getBackupClientShard } from "../action/get-backup-shard"
import { getUserProfile } from "../action/get-user-profile"
import { keygen } from "../action/keygen"
import { personalSign } from "../action/personal-sign"
import { RONIN_GAS_SPONSOR_TYPE, type TransactionParams } from "../action/send-transaction/common"
import { sendLegacyTransaction } from "../action/send-transaction/send-legacy"
import { sendSponsoredTransaction } from "../action/send-transaction/send-sponsored"
import { signTypedData } from "../action/sign-typed-data"
import { validateSponsorTransaction } from "../action/validate-sponsor-tx"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { getServiceUrls, type ServiceEnv } from "../utils/service-url"
import { BaseProvider } from "./base-provider"

export type CreateBaseClientOpts = {
  waypointToken?: string
  clientShard?: string

  chainId: number
  overrideRpcUrl?: string

  serviceEnv?: ServiceEnv
  wasmUrl?: string
}

// ! Keep the same interface with internal libs
export class BaseClient {
  readonly chainId: number
  readonly rpcUrl: string
  readonly publicClient: Client

  private waypointToken: string
  private clientShard: string

  private readonly httpUrl: string
  private readonly wsUrl: string
  private readonly wasmUrl: string

  private cachedAddress: Address | undefined

  protected constructor(opts: CreateBaseClientOpts) {
    const {
      chainId,
      overrideRpcUrl,

      waypointToken = "",
      clientShard = "",

      serviceEnv = "prod",
      wasmUrl = "https://storage.googleapis.com/thien-cdn/mpc/wasm/staging/mpc.wasm",
    } = opts
    const { httpUrl, wsUrl } = getServiceUrls(serviceEnv)

    this.waypointToken = waypointToken
    this.clientShard = clientShard

    this.httpUrl = httpUrl
    this.wsUrl = wsUrl
    this.wasmUrl = wasmUrl

    this.chainId = chainId
    if (overrideRpcUrl) {
      this.rpcUrl = overrideRpcUrl
      this.publicClient = createClient({
        transport: http(overrideRpcUrl),
      })
    } else {
      const rpcUrl = VIEM_CHAIN_MAPPING[chainId]?.rpcUrls?.default?.http[0]

      if (!rpcUrl) {
        throw new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedChainIdError,
          message: `Unsupported chainId. Unable to find rpcUrl for chainId="${chainId}". Please provide an "overrideRpcUrl" parameter.`,
        })
      }

      this.rpcUrl = rpcUrl
      this.publicClient = createClient({
        chain: VIEM_CHAIN_MAPPING[chainId],
        transport: http(),
      })
    }
  }

  static create = (opts: CreateBaseClientOpts) => {
    return new BaseClient(opts)
  }

  setWaypointToken = (newToken: string) => {
    this.waypointToken = newToken

    this.cachedAddress = undefined
  }

  setClientShard = (newShard: string) => {
    this.clientShard = newShard
  }

  isSignable = () => {
    const { getAddressFromClientShard } = this
    try {
      const address = getAddressFromClientShard()

      return isAddress(address)
    } catch (error) {
      /* empty */
    }

    return false
  }

  genMpc = async () => {
    const { wasmUrl, wsUrl, waypointToken, setClientShard } = this
    const clientShard = await keygen({
      wasmUrl,
      waypointToken,
      wsUrl,
    })

    // ? set client shard for future action
    setClientShard(clientShard)
    return clientShard
  }

  encryptClientShard = (recoveryPassword: string) => {
    const { clientShard, waypointToken } = this

    return encryptShard({
      clientShard: clientShard,
      waypointToken,
      recoveryPassword,
    })
  }

  decryptClientShard = async (encryptedShard: string, recoveryPassword: string) => {
    const { waypointToken, setClientShard } = this
    const clientShard = await decryptShard({
      encryptedData: encryptedShard,
      recoveryPassword,
      waypointToken,
    })

    // ? set client shard for future action
    setClientShard(clientShard)
    return clientShard
  }

  backupClientShard = (recoveryPassword: string) => {
    const { wsUrl, waypointToken, clientShard } = this

    return backupShard({
      clientShard: clientShard,
      waypointToken,
      recoveryPassword,
      wsUrl,
    })
  }

  getBackupClientShard = () => {
    const { httpUrl, waypointToken } = this
    return getBackupClientShard({ httpUrl, waypointToken })
  }

  getUserProfile = () => {
    const { httpUrl, waypointToken } = this
    return getUserProfile({ httpUrl, waypointToken })
  }

  getAddressFromClientShard = () => {
    const { clientShard } = this

    return getAddressFromShard(clientShard)
  }

  getAddress = async () => {
    try {
      return await this.getAddressFromClientShard()
    } catch (error) {
      /* empty */
    }

    // ? fallback to get address from user profile
    // * only using address from profile when client shard is valid
    if (this.cachedAddress) {
      return this.cachedAddress
    }

    const userProfile = await this.getUserProfile()
    this.cachedAddress = userProfile.address
    return userProfile.address
  }

  signMessage = (message: SignableMessage) => {
    const { clientShard, wsUrl, waypointToken, wasmUrl } = this

    return personalSign({
      message,
      clientShard,
      waypointToken,

      wsUrl,
      wasmUrl,
    })
  }

  signTypedData = (typedData: TypedDataDefinition) => {
    const { clientShard, wsUrl, waypointToken, wasmUrl } = this

    return signTypedData({
      typedData,
      clientShard,
      waypointToken,

      wsUrl,
      wasmUrl,
    })
  }

  sendTransaction = async (transaction: TransactionParams) => {
    const { clientShard, waypointToken, wsUrl, wasmUrl, chainId, rpcUrl } = this

    if (transaction.type === RONIN_GAS_SPONSOR_TYPE) {
      return sendSponsoredTransaction({
        clientShard,
        waypointToken,
        wsUrl,
        wasmUrl,
        transaction,
        chain: {
          chainId,
          rpcUrl,
        },
      })
    }

    return sendLegacyTransaction({
      clientShard,
      waypointToken,
      wsUrl,
      wasmUrl,
      transaction,
      chain: {
        chainId,
        rpcUrl,
      },
    })
  }

  validateSponsorTx = async (transaction: TransactionParams) => {
    const { httpUrl, waypointToken, chainId, rpcUrl, getAddress } = this

    const currentAddress = await getAddress()
    return await validateSponsorTransaction({
      httpUrl,
      waypointToken,
      chain: { chainId, rpcUrl },
      transaction,
      currentAddress,
    })
  }

  getProvider = () => {
    return BaseProvider.fromBaseClient(this)
  }
}
