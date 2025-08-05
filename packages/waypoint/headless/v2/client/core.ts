import { Address, SignableMessage, TypedDataDefinition } from "viem"

import { AbstractHeadlessCore, CreateAbstractHeadlessCore } from "../../common/abstracts/core"
import { TransactionParams } from "../../common/transaction/common"
import { isRoninGasSponsorTransaction } from "../../common/transaction/tx-type-check"
import {
  getPasswordlessServiceUrls,
  getServiceUrls,
  isPasswordlessProd,
  PasswordlessServiceUrls,
} from "../../common/utils/service-url"
import { validateToken } from "../../common/utils/token"
import { validateSponsorTransaction } from "../../v1/action/helpers/validate-sponsor-tx"
import { getUserProfile as _getUserProfile } from "../action/get-user-profile"
import { encryptContent } from "../action/helpers/key-actions"
import { decryptClientShard, encryptClientShard } from "../action/helpers/shard-actions"
import {
  generateExchangeAsymmetricKey,
  generateKeyPasswordless,
  getExchangePublicKey as _getExchangePublicKey,
} from "../action/key-actions"
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

export type CreateHeadlessPasswordlessCoreOpts = CreateAbstractHeadlessCore<PasswordlessServiceUrls>

export class HeadlessPasswordlessCore extends AbstractHeadlessCore<PasswordlessServiceUrls> {
  private readonly httpUrl: string
  private publicKey?: string
  private address?: Address
  private readonly lockboxHttpUrl: string

  public constructor(opts: CreateHeadlessPasswordlessCoreOpts) {
    super(opts)

    const { serviceEnv = "prod" } = opts
    const { httpUrl } = getPasswordlessServiceUrls(serviceEnv)

    const isProd = isPasswordlessProd(httpUrl)
    this.lockboxHttpUrl = getServiceUrls(isProd ? "prod" : "stag").httpUrl

    this.httpUrl = httpUrl
  }

  private validateWaypointToken = () => {
    if (!this.waypointToken) {
      throw new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.WaypointTokenNotFoundError,
        message: "Waypoint token not found. Set waypoint token before using this method.",
      })
    }

    return validateToken(this.waypointToken)
  }

  isSignable = async () => {
    const address = await this.getAddress()
    return this.validateWaypointToken() && address
  }

  genMpc = async () => {
    await this.validateWaypointToken()

    return generateKeyPasswordless({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
    })
  }

  getUserProfile = async () => {
    await this.validateWaypointToken()

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

  signMessage = async (message: SignableMessage) => {
    const address = await this.isSignable()

    return personalSign({
      message,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  signTypedData = async (typedData: TypedDataDefinition) => {
    const address = await this.isSignable()

    return signTypedData({
      typedData,
      waypointToken: this.waypointToken,
      address,
      httpUrl: this.httpUrl,
    })
  }

  sendTransaction = async (transaction: TransactionParams) => {
    const { chainId, rpcUrl } = this
    const address = await this.isSignable()

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

    const generateAsymmetricKeyResult = await generateExchangeAsymmetricKey({
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
      const getPublicKeyResult = await _getExchangePublicKey({
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

    const { encryptedContent: clientEncryptedKey, encryptionKey } = await encryptContent(publicKey)

    const pullShardResult = await pullShard({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      clientEncryptedKey: btoa(String.fromCharCode(...new Uint8Array(clientEncryptedKey))),
    })

    return decryptClientShard({
      shardCiphertextB64: pullShardResult.shardCiphertextB64,
      shardNonceB64: pullShardResult.shardNonceB64,
      aesKey: encryptionKey,
    })
  }

  migrateShardFromPassword = async (clientShard?: string) => {
    await this.validateWaypointToken()

    if (!clientShard && !this.clientShard) {
      throw new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.ClientShardNotFoundError,
        message: "Client shard not found. Set client shard before using this method.",
      })
    }

    const encryptedShardPayload = await encryptClientShard({
      shard: clientShard || this.clientShard,
      exchangePublicKey: await this.getExchangePublicKey(),
    })

    return migrateShard({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      ...encryptedShardPayload,
    })
  }

  validateSponsorTx = async (transaction: TransactionParams) => {
    const { waypointToken, chainId, rpcUrl, lockboxHttpUrl } = this

    const currentAddress = await this.isSignable()

    return await validateSponsorTransaction({
      httpUrl: lockboxHttpUrl,
      waypointToken,
      chain: { chainId, rpcUrl },
      transaction,
      currentAddress,
    })
  }
}
