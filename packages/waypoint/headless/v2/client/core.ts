import { Address, SignableMessage, TypedDataDefinition } from "viem"

import { AbstractHeadlessCore, CreateAbstractHeadlessCoreOpts } from "../../common/abstracts/core"
import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { ServerError, ServerErrorCode } from "../../common/error/server"
import { TransactionParams } from "../../common/transaction/common"
import { isRoninGasSponsorTransaction } from "../../common/transaction/tx-type-check"
import {
  getHeadlessV1ServiceUrls,
  getHeadlessV2ServiceUrls,
  HeadlessV2ServiceEnv,
  isHeadlessV2Prod,
} from "../../common/utils/service-url"
import { tokenCache } from "../../common/utils/token-cache"
import { validateSponsorTransaction } from "../../v1"
import { authenticateAction } from "../action/authenticate"
import {
  generateExchangeAsymmetricKeyAction,
  generateKeyPasswordlessAction,
} from "../action/key-actions"
import { migrateShardAction } from "../action/migrate-shard"
import { personalSignAction } from "../action/personal-sign"
import { pullShardAction } from "../action/pull-shard"
import { sendPaidTransactionAction } from "../action/send-paid-tx"
import { sendSponsoredTransactionAction } from "../action/send-sponsored"
import { setPasswordAction } from "../action/set-password"
import { signTypedDataAction } from "../action/sign-typed-data"
import { getUserProfileApi } from "../api/get-user-profile"
import { getExchangePublicKeyApi } from "../api/key"

type ExtraOptions = {
  serviceEnv?: HeadlessV2ServiceEnv
}

export type CreateHeadlessV2CoreOpts = CreateAbstractHeadlessCoreOpts<ExtraOptions>

export class HeadlessV2Core extends AbstractHeadlessCore<ExtraOptions> {
  private readonly httpUrl: string
  private publicKey?: string
  private address?: Address
  private readonly lockboxHttpUrl: string

  public constructor(opts: CreateHeadlessV2CoreOpts) {
    super(opts)

    const { serviceEnv = "prod" } = opts
    const { httpUrl } = getHeadlessV2ServiceUrls(serviceEnv)

    const isProd = isHeadlessV2Prod(httpUrl)
    this.lockboxHttpUrl = getHeadlessV1ServiceUrls(isProd ? "prod" : "stag").httpUrl

    this.httpUrl = httpUrl
  }

  private ensureWaypointTokenValid = () => {
    if (!this.waypointToken) {
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.WaypointTokenNotFoundError,
        message: "Waypoint token not found. Set waypoint token before using this method.",
      })
    }

    return tokenCache.validateToken(this.waypointToken)
  }

  isSignable = () => {
    return this.ensureWaypointTokenValid() && !!this.address
  }

  getSignableAddress = async () => {
    const address = this.getAddress()

    if (address) {
      return address
    }

    const { address: signableAddress } = await this.getUserProfile()

    return signableAddress
  }

  genMpc = async () => {
    this.ensureWaypointTokenValid()

    return generateKeyPasswordlessAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })
  }

  getUserProfile = async () => {
    this.ensureWaypointTokenValid()

    const userProfile = await getUserProfileApi({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })

    this.address = userProfile.address

    return userProfile
  }

  getAddress = () => {
    return this.address ?? null
  }

  signMessage = async (message: SignableMessage) => {
    const address = await this.getSignableAddress()

    return personalSignAction({
      message,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  signTypedData = async (data: TypedDataDefinition | string) => {
    const address = await this.getSignableAddress()

    return signTypedDataAction({
      data,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  sendTransaction = async (transaction: TransactionParams) => {
    const { chainId, rpcUrl } = this
    const address = await this.getSignableAddress()

    if (isRoninGasSponsorTransaction(transaction.type)) {
      return sendSponsoredTransactionAction({
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

    return sendPaidTransactionAction({
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

  private genExchangeAsymmetricKey = async () => {
    this.ensureWaypointTokenValid()

    const generateAsymmetricKeyResult = await generateExchangeAsymmetricKeyAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })

    this.publicKey = generateAsymmetricKeyResult.public_key

    return generateAsymmetricKeyResult.public_key
  }

  getExchangePublicKey = async () => {
    if (this.publicKey) {
      return this.publicKey
    }

    this.ensureWaypointTokenValid()

    try {
      const getPublicKeyResult = await getExchangePublicKeyApi({
        httpUrl: this.httpUrl,
        waypointToken: this.waypointToken,
      })

      return getPublicKeyResult.public_key
    } catch (error) {
      if (error instanceof ServerError && error.code === ServerErrorCode.NotFound) {
        const publicKey = await this.genExchangeAsymmetricKey()
        return publicKey
      }

      throw error
    }
  }

  pullClientShard = async () => {
    if (this.clientShard) {
      return this.clientShard
    }

    this.ensureWaypointTokenValid()
    const publicKey = await this.getExchangePublicKey()

    return pullShardAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      exchangePublicKey: publicKey,
    })
  }

  migrateShardFromPassword = async (clientShard?: string) => {
    this.ensureWaypointTokenValid()
    const shard = clientShard || this.clientShard

    if (!shard) {
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.ClientShardNotFoundError,
        message: "Client shard not found. Set client shard before using this method.",
      })
    }

    const exchangePublicKey = await this.getExchangePublicKey()

    return migrateShardAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      clientShard: shard,
      exchangePublicKey,
    })
  }

  validateSponsorTx = async (transaction: TransactionParams) => {
    const { waypointToken, chainId, rpcUrl, lockboxHttpUrl } = this

    const currentAddress = await this.getSignableAddress()

    return validateSponsorTransaction({
      httpUrl: lockboxHttpUrl,
      waypointToken,
      chain: { chainId, rpcUrl },
      transaction,
      currentAddress,
    })
  }

  setPassword = async (password: string) => {
    // Ensure user has an address
    await this.getSignableAddress()
    const exchangePublicKey = await this.getExchangePublicKey()

    return setPasswordAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      password,
      exchangePublicKey,
    })
  }

  authenticate = async (password: string) => {
    // Ensure user has an address
    await this.getSignableAddress()
    const exchangePublicKey = await this.getExchangePublicKey()

    return authenticateAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      password,
      exchangePublicKey,
    })
  }
}
