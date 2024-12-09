import { TransactionParams } from "../action/send-transaction/common"
import { ServiceEnv } from "../utils/service-url"
import { BaseClient } from "./base-client"
import { _defaultShardStorage, type ClientShardStorage } from "./shard-storage"

export type CreateHeadlessClientOpts = {
  chainId: number
  overrideRpcUrl?: string
  wasmUrl?: string
  storage?: ClientShardStorage
  serviceEnv?: ServiceEnv
}

export type BaseParams = {
  waypointToken: string
}
export type ConnectParams = BaseParams & {
  recoveryPassword: string
}
export type ConnectWithShardParams = BaseParams & {
  clientShard: string
}
export type ReconnectParams = BaseParams
export type ValidateSponsorTxParams = BaseParams & {
  txRequest: TransactionParams
}

export class HeadlessClient {
  private baseClient: BaseClient
  private storage: ClientShardStorage

  protected constructor(opts: CreateHeadlessClientOpts) {
    const {
      chainId,
      overrideRpcUrl,
      wasmUrl,
      storage = _defaultShardStorage,
      serviceEnv = "prod",
    } = opts

    this.storage = storage
    this.baseClient = BaseClient.create({
      chainId,
      overrideRpcUrl,
      wasmUrl,
      serviceEnv,
    })
  }

  static create = (opts: CreateHeadlessClientOpts) => {
    return new HeadlessClient(opts)
  }

  isConnected = () => {
    return this.baseClient.isSignable()
  }

  getAddress = () => {
    return this.baseClient.getAddressFromClientShard()
  }

  getProvider = () => {
    return this.baseClient.getProvider()
  }

  connect = async (params: ConnectParams) => {
    const { recoveryPassword, waypointToken } = params
    const { baseClient, storage } = this

    baseClient.setWaypointToken(waypointToken)

    const { key: backupShard } = await baseClient.getBackupClientShard()
    const clientShard = await baseClient.decryptClientShard(backupShard, recoveryPassword)
    const address = await baseClient.getAddressFromClientShard()
    const provider = await baseClient.getProvider()

    storage.set(clientShard)

    return {
      address,
      provider,
    }
  }

  connectWithShard = async (params: ConnectWithShardParams) => {
    const { clientShard, waypointToken } = params
    const { baseClient, storage } = this

    baseClient.setWaypointToken(waypointToken)
    baseClient.setClientShard(clientShard)

    const address = await baseClient.getAddressFromClientShard()
    const provider = await baseClient.getProvider()

    storage.set(clientShard)

    return {
      address,
      provider,
    }
  }

  reconnect = async (params: ReconnectParams) => {
    const { waypointToken } = params
    const { baseClient, storage } = this
    const clientShard = storage.get()

    baseClient.setWaypointToken(waypointToken)
    baseClient.setClientShard(clientShard)

    const address = await baseClient.getAddressFromClientShard()
    const provider = baseClient.getProvider()

    return {
      address,
      provider,
    }
  }

  validateSponsorTx = (params: ValidateSponsorTxParams) => {
    const { txRequest, waypointToken } = params
    const { baseClient } = this

    baseClient.setWaypointToken(waypointToken)
    return baseClient.validateSponsorTx(txRequest)
  }
}
