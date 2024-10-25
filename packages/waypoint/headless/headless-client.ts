import { type GenericTransaction, Lockbox, type LockboxProvider } from "@axieinfinity/lockbox"
import { type Address } from "viem"

import { HeadlessClientError } from "./error"
import { _defaultShardStorage, type ClientShardStorage } from "./shard-storage"
import { RONIN_GAS_SPONSOR_TYPE } from "./tx"

type TrackParams = {
  enable: boolean
  timeout: number
}
type WasmParams = {
  trackParams: TrackParams
  timeout: number
  optionalParams: string
}
export type _LockboxConfig = {
  chainId: number
  overrideRpcUrl?: string
  wasmUrl?: string
  wasmParams?: WasmParams
}
export type CreateHeadlessClientOpts = _LockboxConfig & {
  storage?: ClientShardStorage
}

export type BaseParams = {
  waypointToken: string
}
export type ConnectParam = BaseParams & {
  recoveryPassword: string
}
export type ReconnectParams = BaseParams
export type ValidateSponsorTxParams = BaseParams & {
  txRequest: GenericTransaction
}

export class HeadlessClient {
  private lockbox: Lockbox
  private storage: ClientShardStorage
  private provider?: LockboxProvider
  private address?: Address

  protected constructor(config: _LockboxConfig, storage: ClientShardStorage) {
    try {
      this.lockbox = Lockbox.init(config)
    } catch (error) {
      throw new HeadlessClientError(error, {
        code: -100,
        shortMessage: "could NOT init HeadlessClient",
      })
    }

    this.storage = storage
  }

  static create = (opts: CreateHeadlessClientOpts) => {
    const { storage, ...lockboxConfig } = opts
    return new HeadlessClient(lockboxConfig, storage ?? _defaultShardStorage)
  }

  private getBackupClientShard = async () => {
    const { lockbox } = this

    try {
      const { key } = await lockbox.getBackupClientShard()

      return key
    } catch (error) {
      throw new HeadlessClientError(error, {
        code: -200,
        shortMessage: "could NOT get backup client shard",
      })
    }
  }

  private decryptClientShard = async (backupShard: string, recoveryPassword: string) => {
    const { lockbox } = this

    try {
      return await lockbox.decryptClientShard(backupShard, recoveryPassword)
    } catch (error) {
      throw new HeadlessClientError(error, {
        code: -300,
        shortMessage: "could NOT decrypt client shard",
      })
    }
  }

  private validateSignature = async () => {
    const { lockbox } = this

    try {
      await lockbox.signMessage("test")

      return true
    } catch (error) {
      throw new HeadlessClientError(error, {
        code: -600,
        shortMessage: "could NOT validate keyless wallet signature",
      })
    }
  }

  private getLockboxProvider = () => {
    const { lockbox } = this

    try {
      return lockbox.getProvider()
    } catch (error) {
      throw new HeadlessClientError(error, {
        code: -500,
        shortMessage: "could NOT initialize provider",
      })
    }
  }

  isConnected = () => {
    return !!this.provider && !!this.address
  }

  getAddress = () => {
    if (!this.address) {
      throw new HeadlessClientError(undefined, {
        code: -700,
        shortMessage: "address is NOT available",
      })
    }

    return this.address
  }

  getProvider = () => {
    if (!this.provider) {
      throw new HeadlessClientError(undefined, {
        code: -700,
        shortMessage: "provider is NOT available",
      })
    }

    return this.provider
  }

  connect = async (params: ConnectParam) => {
    const { recoveryPassword, waypointToken } = params
    const {
      lockbox,
      storage,
      getBackupClientShard,
      decryptClientShard,
      validateSignature,
      getLockboxProvider,
    } = this

    lockbox.setAccessToken(waypointToken)

    const backupShard = await getBackupClientShard()
    const clientShard = await decryptClientShard(backupShard, recoveryPassword)
    await validateSignature()
    const address = await lockbox.getAddress()
    const provider = getLockboxProvider()

    storage.set(clientShard)
    this.provider = provider
    this.address = address

    return {
      address,
      provider,
    }
  }

  reconnect = async (params: ReconnectParams) => {
    const { waypointToken } = params
    const { lockbox, storage, validateSignature, getLockboxProvider } = this

    const clientShard = storage.get()
    if (!clientShard) {
      throw new HeadlessClientError(undefined, {
        code: -410,
        shortMessage: "client shard get from storage is NOT valid",
      })
    }

    lockbox.setClientShard(clientShard)
    lockbox.setAccessToken(waypointToken)

    await validateSignature()
    const address = await lockbox.getAddress()
    const provider = getLockboxProvider()

    this.provider = provider
    this.address = address
    return {
      address,
      provider,
    }
  }

  validateSponsorTx = (params: ValidateSponsorTxParams) => {
    const { txRequest, waypointToken } = params
    const { lockbox } = this

    const sponsorTx: GenericTransaction = {
      ...txRequest,
      type: RONIN_GAS_SPONSOR_TYPE,
    }

    lockbox.setAccessToken(waypointToken)
    return lockbox.validateSponsorTx(sponsorTx)
  }
}
