import { Address, Client, createClient, http, SignableMessage, TypedDataDefinition } from "viem"

import { VIEM_CHAIN_MAPPING } from "../../../common"
import { validateSponsorTransaction } from "../../headless/action/validate-sponsor-tx"
import { TransactionParams } from "../../headless-common-helper/transaction/common"
import { isRoninGasSponsorTransaction } from "../../headless-common-helper/transaction/tx-type-check"
import {
  getPasswordlessServiceUrls,
  PasswordlessServiceEnv,
} from "../../headless-common-helper/utils/service-url"
import { validateToken } from "../../headless-common-helper/utils/token"
import { getUserProfile as _getUserProfile } from "../action/get-user-profile"
import { encryptContent } from "../action/helpers/key-actions"
import { decryptClientShard, encryptClientShard } from "../action/helpers/shard-actions"
import { generateAsymmetricKey, generateKeyPasswordless, getPublicKey } from "../action/key-actions"
import { migrateShard } from "../action/migrate-shard"
import { pullShard } from "../action/pull-shard"
import { sendPaidTransaction } from "../action/send-transaction/send-paid-tx"
import { sendSponsoredTransaction } from "../action/send-transaction/send-sponsored"
import { personalSign } from "../action/sign/personal-sign"
import { signTypedData } from "../action/sign/sign-typed-data"
import {
  HeadlessPasswordlessClientError,
  HeadlessPasswordlessClientErrorCode,
} from "../error/client"
import { ServerError, ServerErrorCode } from "../error/server"
import { HeadlessPasswordlessProvider } from "./provider"

export type CreateHeadlessPasswordlessCoreOpts = {
  waypointToken?: string
  clientShard?: string

  chainId: number
  overrideRpcUrl?: string

  serviceEnv?: PasswordlessServiceEnv
}

export class HeadlessPasswordlessCore {
  readonly chainId: number
  readonly rpcUrl: string
  readonly publicClient: Client

  private waypointToken: string
  private clientShard: string

  private readonly httpUrl: string
  private publicKey?: string
  private address?: Address

  protected constructor(opts: CreateHeadlessPasswordlessCoreOpts) {
    const {
      chainId,
      overrideRpcUrl,

      waypointToken = "",
      clientShard = "",

      serviceEnv = "prod",
    } = opts
    const { httpUrl } = getPasswordlessServiceUrls(serviceEnv)

    this.waypointToken = waypointToken
    this.clientShard = clientShard

    this.httpUrl = httpUrl

    this.chainId = chainId
    if (overrideRpcUrl) {
      this.rpcUrl = overrideRpcUrl
      this.publicClient = createClient({
        transport: http(overrideRpcUrl),
      })
    } else {
      const rpcUrl = VIEM_CHAIN_MAPPING[chainId]?.rpcUrls?.default?.http[0]

      if (!rpcUrl) {
        throw new HeadlessPasswordlessClientError({
          cause: undefined,
          code: HeadlessPasswordlessClientErrorCode.UnsupportedChainIdError,
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

  static create = (opts: CreateHeadlessPasswordlessCoreOpts) => {
    return new HeadlessPasswordlessCore(opts)
  }

  setWaypointToken = (waypointToken: string) => {
    this.waypointToken = waypointToken
  }

  setClientShard = (clientShard: string) => {
    this.clientShard = clientShard
  }

  private interactWithPasswordlessServicePrepared = async <S extends boolean = false>(
    signable: S = false as S,
  ): Promise<S extends true ? Address : boolean> => {
    if (!this.waypointToken) {
      throw new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.WaypointTokenNotFoundError,
        message: "Waypoint token not found. Set waypoint token before using this method.",
      })
    }
    const isTokenValid = validateToken(this.waypointToken)
    const needAddress = signable ? !!(await this.getAddress()) : true

    return needAddress && (isTokenValid as S extends true ? Address : boolean)
  }

  genMpc = async () => {
    await this.interactWithPasswordlessServicePrepared()

    return generateKeyPasswordless({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })
  }

  getUserProfile = async () => {
    await this.interactWithPasswordlessServicePrepared()

    const userProfile = await _getUserProfile({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })

    this.address = userProfile.address

    return userProfile
  }

  getAddress = async () => {
    if (this.address) {
      return this.address
    }

    const userProfile = await this.getUserProfile()

    return userProfile.address
  }

  getChainId = () => {
    return this.chainId
  }

  signMessage = async (message: SignableMessage) => {
    const address = await this.interactWithPasswordlessServicePrepared(true)

    return personalSign({
      message,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  signTypedData = async (typedData: TypedDataDefinition) => {
    const address = await this.interactWithPasswordlessServicePrepared(true)

    return signTypedData({
      typedData,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  sendTransaction = async (transaction: TransactionParams) => {
    const { chainId, rpcUrl } = this
    const address = await this.interactWithPasswordlessServicePrepared(true)

    if (isRoninGasSponsorTransaction(transaction.type)) {
      return sendSponsoredTransaction({
        waypointToken: this.waypointToken,
        httpUrl: this.httpUrl,
        address,
        transaction,
        chain: {
          chainId,
          rpcUrl,
        },
      })
    }

    return sendPaidTransaction({
      waypointToken: this.waypointToken,
      httpUrl: this.httpUrl,
      transaction,
      address,
      chain: {
        chainId,
        rpcUrl,
      },
    })
  }

  private genPasswordlessAsymmetricKey = async () => {
    await this.interactWithPasswordlessServicePrepared()

    const generateAsymmetricKeyResult = await generateAsymmetricKey({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })

    this.publicKey = generateAsymmetricKeyResult.public_key

    return generateAsymmetricKeyResult.public_key
  }

  getPasswordlessPublicKey = async () => {
    if (this.publicKey) {
      return this.publicKey
    }

    await this.interactWithPasswordlessServicePrepared()

    try {
      const getPublicKeyResult = await getPublicKey({
        httpUrl: this.httpUrl,
        waypointToken: this.waypointToken,
      })

      return getPublicKeyResult.public_key
    } catch (error) {
      if (error instanceof ServerError && error.code === ServerErrorCode.NotFound) {
        const publicKey = await this.genPasswordlessAsymmetricKey()
        return publicKey
      }

      throw error
    }
  }

  pullClientShard = async () => {
    if (this.clientShard) {
      return this.clientShard
    }

    await this.interactWithPasswordlessServicePrepared()
    const publicKey = await this.getPasswordlessPublicKey()

    const { encryptedContent: clientEncryptedKey, contentKey } = await encryptContent(publicKey)

    const pullShardResult = await pullShard({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      clientEncryptedKey: btoa(String.fromCharCode(...new Uint8Array(clientEncryptedKey))),
    })

    return decryptClientShard({
      shardCiphertextB64: pullShardResult.shardCiphertextB64,
      shardNonceB64: pullShardResult.shardNonceB64,
      aesKey: contentKey,
    })
  }

  migrateShardFromPassword = async (clientShard?: string) => {
    await this.interactWithPasswordlessServicePrepared()

    if (!clientShard && !this.clientShard) {
      throw new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.ClientShardNotFoundError,
        message: "Client shard not found. Set client shard before using this method.",
      })
    }

    const encryptedShardPayload = await encryptClientShard({
      shard: clientShard || this.clientShard,
      publicKey: await this.getPasswordlessPublicKey(),
    })

    return migrateShard({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      ...encryptedShardPayload,
    })
  }

  //Todo: move to common
  validateSponsorTx = async (transaction: TransactionParams) => {
    const { httpUrl, waypointToken, chainId, rpcUrl } = this

    const currentAddress = await this.interactWithPasswordlessServicePrepared(true)

    return await validateSponsorTransaction({
      httpUrl,
      waypointToken,
      chain: { chainId, rpcUrl },
      transaction,
      currentAddress,
    })
  }

  getProvider = () => {
    return HeadlessPasswordlessProvider.fromHeadlessCore(this)
  }
}
