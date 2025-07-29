import {
  type Client,
  createClient,
  http,
  isAddress,
  type SignableMessage,
  type TypedDataDefinition,
} from "viem"

import { VIEM_CHAIN_MAPPING } from "../../../common"
import { TransactionParams } from "../../headless-common-helper/transaction/common"
import { isRoninGasSponsorTransaction } from "../../headless-common-helper/transaction/tx-type-check"
import { getServiceUrls, ServiceEnv } from "../../headless-common-helper/utils/service-url"
import { validateToken } from "../../headless-common-helper/utils/token"
import { backupShard } from "../action/backup-shard"
import { decryptShard } from "../action/decrypt-shard"
import { encryptShard } from "../action/encrypt-shard"
import { getAddressFromShard } from "../action/get-address"
import { getBackupClientShard } from "../action/get-backup-shard"
import { getUserProfile } from "../action/get-user-profile"
import { keygen } from "../action/keygen"
import { personalSign } from "../action/personal-sign"
import { sendPaidTransaction } from "../action/send-transaction/send-paid-tx"
import { sendSponsoredTransaction } from "../action/send-transaction/send-sponsored"
import { signTypedData } from "../action/sign-typed-data"
import { validateSponsorTransaction } from "../action/validate-sponsor-tx"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { WASM_URL } from "../wasm/cdn"
import { HeadlessProvider } from "./provider"

export type CreateHeadlessCoreOpts = {
  waypointToken?: string
  clientShard?: string

  chainId: number
  overrideRpcUrl?: string

  serviceEnv?: ServiceEnv
  wasmUrl?: string
}

// ! Keep the same interface with internal libs
export class HeadlessCore {
  readonly chainId: number
  readonly rpcUrl: string
  readonly publicClient: Client

  private waypointToken: string
  private clientShard: string

  private readonly httpUrl: string
  private readonly wsUrl: string
  private readonly wasmUrl: string

  protected constructor(opts: CreateHeadlessCoreOpts) {
    const {
      chainId,
      overrideRpcUrl,

      waypointToken = "",
      clientShard = "",

      serviceEnv = "prod",
      wasmUrl = WASM_URL,
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
          message: `Unsupported chain. Unable to find rpcUrl for chainId="${chainId}". Please provide an "overrideRpcUrl" parameter.`,
        })
      }

      this.rpcUrl = rpcUrl
      this.publicClient = createClient({
        chain: VIEM_CHAIN_MAPPING[chainId],
        transport: http(),
      })
    }
  }

  static create = (opts: CreateHeadlessCoreOpts) => {
    return new HeadlessCore(opts)
  }

  setWaypointToken = (newToken: string) => {
    this.waypointToken = newToken
  }

  setClientShard = (newShard: string) => {
    this.clientShard = newShard
  }

  isSignable = () => {
    const { waypointToken, clientShard } = this

    try {
      const isValidShard = isAddress(getAddressFromShard(clientShard))
      const isValidToken = validateToken(waypointToken)

      return isValidShard && isValidToken
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

  getAddress = () => {
    const { clientShard } = this

    return getAddressFromShard(clientShard)
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

  sendTransaction = (transaction: TransactionParams) => {
    const { clientShard, waypointToken, wsUrl, wasmUrl, chainId, rpcUrl } = this

    if (isRoninGasSponsorTransaction(transaction.type)) {
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

    return sendPaidTransaction({
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

  getBackupClientShard = () => {
    const { httpUrl, waypointToken } = this
    return getBackupClientShard({ httpUrl, waypointToken })
  }

  getUserProfile = () => {
    const { httpUrl, waypointToken } = this
    return getUserProfile({ httpUrl, waypointToken })
  }

  validateSponsorTx = async (transaction: TransactionParams) => {
    const { httpUrl, waypointToken, chainId, rpcUrl, getAddress } = this

    const currentAddress = getAddress()
    return await validateSponsorTransaction({
      httpUrl,
      waypointToken,
      chain: { chainId, rpcUrl },
      transaction,
      currentAddress,
    })
  }

  getProvider = () => {
    return HeadlessProvider.fromHeadlessCore(this)
  }
}
