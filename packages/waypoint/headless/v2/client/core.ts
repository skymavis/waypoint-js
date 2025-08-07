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
import { TokenCache } from "../../v1"
import { validateSponsorTransaction } from "../../v1/action/helpers/validate-sponsor-tx"
import { authenticateAction } from "../action/authenticate"
import {
  generateExchangeAsymmetricKeyAction,
  generateKeyPasswordlessAction,
} from "../action/key-actions"
import { migrateShardAction } from "../action/migrate-shard"
import { pullShardAction } from "../action/pull-shard"
import { sendPaidTransaction } from "../action/send-transaction/send-paid-tx"
import { sendSponsoredTransaction } from "../action/send-transaction/send-sponsored"
import { setPasswordAction } from "../action/set-password"
import { personalSign } from "../action/sign/personal-sign"
import { signTypedData } from "../action/sign/sign-typed-data"
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

  private validateWaypointToken = () => {
    if (!this.waypointToken) {
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.WaypointTokenNotFoundError,
        message: "Waypoint token not found. Set waypoint token before using this method.",
      })
    }

    return TokenCache.validateToken(this.waypointToken)
  }

  isSignable = () => {
    return this.validateWaypointToken() && !!this.address
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
    await this.validateWaypointToken()

    return generateKeyPasswordlessAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })
  }

  getUserProfile = async () => {
    await this.validateWaypointToken()

    const userProfile = await getUserProfileApi({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })

    this.address = userProfile.address

    return userProfile
  }

  getAddress = () => {
    return this.address
  }

  signMessage = async (message: SignableMessage) => {
    const address = await this.getSignableAddress()

    return personalSign({
      message,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  signTypedData = async (typedData: TypedDataDefinition) => {
    const address = await this.getSignableAddress()

    return signTypedData({
      typedData,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  sendTransaction = async (transaction: TransactionParams) => {
    const { chainId, rpcUrl } = this
    const address = await this.getSignableAddress()

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

  private genExchangeAsymmetricKey = async () => {
    await this.validateWaypointToken()

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

    await this.validateWaypointToken()

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

    await this.validateWaypointToken()
    const publicKey = await this.getExchangePublicKey()

    return pullShardAction({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      exchangePublicKey: publicKey,
    })
  }

  migrateShardFromPassword = async (clientShard?: string) => {
    await this.validateWaypointToken()
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

    return await validateSponsorTransaction({
      httpUrl: lockboxHttpUrl,
      waypointToken,
      chain: { chainId, rpcUrl },
      transaction,
      currentAddress,
    })
  }

  setPassword = async (password: string) => {
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
