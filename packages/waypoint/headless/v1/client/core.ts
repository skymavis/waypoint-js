import { isAddress, type SignableMessage, type TypedDataDefinition } from "viem"

import { AbstractHeadlessCore, CreateAbstractHeadlessCore } from "../../common/abstracts/core"
import { TransactionParams } from "../../common/transaction/common"
import { isRoninGasSponsorTransaction } from "../../common/transaction/tx-type-check"
import { getServiceUrls, ServiceUrls } from "../../common/utils/service-url"
import { validateToken } from "../../common/utils/token"
import { backupShard } from "../action/backup-shard"
import { decryptShard } from "../action/decrypt-shard"
import { encryptShard } from "../action/encrypt-shard"
import { getAddressFromShard } from "../action/get-address"
import { getBackupClientShard } from "../action/get-backup-shard"
import { getUserProfile } from "../action/get-user-profile"
import { validateSponsorTransaction } from "../action/helpers/validate-sponsor-tx"
import { keygen } from "../action/keygen"
import { personalSign } from "../action/personal-sign"
import { sendPaidTransaction } from "../action/send-transaction/send-paid-tx"
import { sendSponsoredTransaction } from "../action/send-transaction/send-sponsored"
import { signTypedData } from "../action/sign-typed-data"
import { WASM_URL } from "../wasm/cdn"

type BaseParams = {
  waypointToken: string
}
type ConnectParams = BaseParams & {
  clientShard: string
}
type ConnectWithPasswordParams = BaseParams & {
  recoveryPassword: string
}

export type CreateHeadlessCoreOpts = CreateAbstractHeadlessCore<
  ServiceUrls,
  {
    wasmUrl?: string
  }
>

// ! Keep the same interface with internal libs
export class HeadlessCore extends AbstractHeadlessCore<
  ServiceUrls,
  {
    wasmUrl?: string
  }
> {
  private readonly httpUrl: string
  private readonly wsUrl: string
  private readonly wasmUrl: string

  public constructor(opts: CreateHeadlessCoreOpts) {
    super(opts)

    const { serviceEnv = "prod", wasmUrl = WASM_URL } = opts
    const { httpUrl, wsUrl } = getServiceUrls(serviceEnv)

    this.httpUrl = httpUrl
    this.wsUrl = wsUrl
    this.wasmUrl = wasmUrl
  }

  isSignable = async () => {
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

  connectWithPassword = async (params: ConnectWithPasswordParams) => {
    const { recoveryPassword, waypointToken } = params

    this.setWaypointToken(waypointToken)

    const { key: backupShard } = await this.getBackupClientShard()
    const clientShard = await this.decryptClientShard(backupShard, recoveryPassword)
    const address = this.getAddress()

    return {
      address,
      clientShard,
    }
  }

  connect = (params: ConnectParams) => {
    const { clientShard, waypointToken } = params

    this.setWaypointToken(waypointToken)
    this.setClientShard(clientShard)

    const address = this.getAddress()

    return {
      address,
    }
  }
}
