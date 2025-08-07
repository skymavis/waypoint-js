import { Address, SignableMessage, TypedDataDefinition } from "viem"

import { AbstractHeadlessCore, CreateAbstractHeadlessCore } from "../../common/abstracts/core"
import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { ServerError, ServerErrorCode } from "../../common/error/server"
import { TransactionParams } from "../../common/transaction/common"
import { isRoninGasSponsorTransaction } from "../../common/transaction/tx-type-check"
import {
  getPasswordlessServiceUrls,
  getServiceUrls,
  isPasswordlessProd,
  PasswordlessServiceUrls,
} from "../../common/utils/service-url"
import { TokenCache } from "../../v1"
import { validateSponsorTransaction } from "../../v1/action/helpers/validate-sponsor-tx"
import { authenticate } from "../action/authenticate"
import { getUserProfile } from "../action/get-user-profile"
import { AESDecrypt, AESEncrypt } from "../action/helpers/crypto-actions"
import { encryptContent } from "../action/helpers/key-actions"
import {
  generateExchangeAsymmetricKey,
  generateKeyPasswordless,
  getExchangePublicKey,
} from "../action/key-actions"
import { migrateShard } from "../action/migrate-shard"
import { pullShard } from "../action/pull-shard"
import { sendPaidTransaction } from "../action/send-transaction/send-paid-tx"
import { sendSponsoredTransaction } from "../action/send-transaction/send-sponsored"
import { setPassword } from "../action/set-password"
import { personalSign } from "../action/sign/personal-sign"
import { signTypedData } from "../action/sign/sign-typed-data"

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
    const address = await this.getAddress()
    return address
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

    const userProfile = await getUserProfile({
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
      const getPublicKeyResult = await getExchangePublicKey({
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
      clientEncryptedKey,
    })

    return AESDecrypt({
      ciphertextB64: pullShardResult.shardCiphertextB64,
      nonceB64: pullShardResult.shardNonceB64,
      aesKey: encryptionKey,
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

    const encryptedShardPayload = await AESEncrypt({
      content: shard,
      key: await this.getExchangePublicKey(),
    })

    return migrateShard({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      shardCiphertextB64: encryptedShardPayload.ciphertextB64,
      shardEncryptedKeyB64: encryptedShardPayload.encryptedKeyB64,
      shardNonceB64: encryptedShardPayload.nonceB64,
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

    const encryptedPassword = await AESEncrypt({
      content: password,
      key: await this.getExchangePublicKey(),
    })

    return setPassword({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      ciphertextB64: encryptedPassword.ciphertextB64,
      clientEncryptedKeyB64: encryptedPassword.encryptedKeyB64,
      nonceB64: encryptedPassword.nonceB64,
    })
  }

  authenticate = async (password: string) => {
    await this.getSignableAddress()

    const encryptedPassword = await AESEncrypt({
      content: password,
      key: await this.getExchangePublicKey(),
    })

    return authenticate({
      httpUrl: this.httpUrl,
      waypointToken: this.waypointToken,
      ciphertextB64: encryptedPassword.ciphertextB64,
      clientEncryptedKeyB64: encryptedPassword.encryptedKeyB64,
      nonceB64: encryptedPassword.nonceB64,
    })
  }
}
