import { type GenericTransaction, Lockbox, type LockboxProvider } from "@axieinfinity/lockbox"
import { type Address } from "viem"

import { HeadlessClientError } from "./error"
import { type ClientShardStorage } from "./shard-storage"

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

const getBackupClientShard = async (lockboxClient: Lockbox) => {
  try {
    const { key } = await lockboxClient.getBackupClientShard()

    return key
  } catch (error) {
    throw new HeadlessClientError(error, {
      code: -200,
      shortMessage: "could NOT get backup client shard",
    })
  }
}
const decryptClientShard = async (
  lockboxClient: Lockbox,
  backupShard: string,
  recoveryPassword: string,
) => {
  try {
    return await lockboxClient.decryptClientShard(backupShard, recoveryPassword)
  } catch (error) {
    throw new HeadlessClientError(error, {
      code: -300,
      shortMessage: "could NOT decrypt client shard",
    })
  }
}
const signTestMessage = async (lockboxClient: Lockbox) => {
  try {
    await lockboxClient.signMessage("test")

    return true
  } catch (error) {
    throw new HeadlessClientError(error, {
      code: -600,
      shortMessage: "could NOT sign test message",
    })
  }
}
const getProvider = (lockboxClient: Lockbox) => {
  try {
    return lockboxClient.getProvider()
  } catch (error) {
    throw new HeadlessClientError(error, {
      code: -500,
      shortMessage: "could NOT initialize provider",
    })
  }
}

export class _HeadlessClient {
  private lockbox: Lockbox
  public storage: ClientShardStorage
  public provider?: LockboxProvider
  public address?: Address

  constructor(config: _LockboxConfig, storage: ClientShardStorage) {
    try {
      this.lockbox = Lockbox.init(config)
    } catch (error) {
      throw new HeadlessClientError(error, {
        code: -100,
        shortMessage: "could NOT initialize Lockbox",
      })
    }

    this.storage = storage
  }

  connect = async (params: ConnectParam) => {
    const { recoveryPassword, waypointToken } = params
    const { lockbox, storage } = this

    lockbox.setAccessToken(waypointToken)

    const backupShard = await getBackupClientShard(lockbox)
    const clientShard = await decryptClientShard(lockbox, backupShard, recoveryPassword)
    await signTestMessage(lockbox)
    const address = await lockbox.getAddress()
    const provider = getProvider(lockbox)

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
    const { lockbox, storage } = this

    const clientShard = storage.get()
    if (!clientShard) {
      throw new HeadlessClientError(undefined, {
        code: -310,
        shortMessage: "client shard get from storage is NOT valid",
      })
    }

    lockbox.setClientShard(clientShard)
    lockbox.setAccessToken(waypointToken)

    await signTestMessage(lockbox)
    const address = await lockbox.getAddress()
    const provider = getProvider(lockbox)

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
      type: "0x64",
    }

    lockbox.setAccessToken(waypointToken)
    return lockbox.validateSponsorTx(sponsorTx)
  }
}
