import { Lockbox } from "@axieinfinity/lockbox"

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
export type _OverrideLockboxOpts = {
  overrideRpcUrl?: string
  wasmUrl?: string
  wasmParams?: WasmParams
}

type BaseLockboxOpts = {
  chainId: number
  waypointToken: string
}
export type ConnectOpts = BaseLockboxOpts & {
  recoveryPassword: string
}
export type ReconnectOpts = BaseLockboxOpts

const createLockbox = (baseOpts: BaseLockboxOpts, overrideOpts: _OverrideLockboxOpts) => {
  const { chainId, waypointToken } = baseOpts
  const { overrideRpcUrl, wasmUrl, wasmParams } = overrideOpts

  try {
    return Lockbox.init({
      chainId,
      accessToken: waypointToken,
      overrideRpcUrl,
      wasmUrl,
      wasmParams,
    })
  } catch (error) {
    throw new HeadlessClientError(error, {
      code: -100,
      shortMessage: "could NOT initialize Lockbox",
    })
  }
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
  private _overrideLockboxOtps: _OverrideLockboxOpts
  public storage: ClientShardStorage

  constructor(overrideOpts: _OverrideLockboxOpts, storage: ClientShardStorage) {
    this._overrideLockboxOtps = overrideOpts
    this.storage = storage
  }

  connect = async (opts: ConnectOpts) => {
    const { recoveryPassword } = opts
    const { _overrideLockboxOtps, storage } = this

    const lockboxClient = createLockbox(opts, _overrideLockboxOtps)

    const backupShard = await getBackupClientShard(lockboxClient)
    const clientShard = await decryptClientShard(lockboxClient, backupShard, recoveryPassword)

    await signTestMessage(lockboxClient)

    const address = await lockboxClient.getAddress()
    const provider = getProvider(lockboxClient)

    storage.set(clientShard)

    return {
      address,
      provider,
    }
  }

  reconnect = async (opts: ReconnectOpts) => {
    const { _overrideLockboxOtps, storage } = this

    const lockboxClient = createLockbox(opts, _overrideLockboxOtps)

    const clientShard = storage.get()
    if (!clientShard) {
      throw new HeadlessClientError(undefined, {
        code: -310,
        shortMessage: "client shard get from storage is NOT valid",
      })
    }
    lockboxClient.setClientShard(clientShard)

    await signTestMessage(lockboxClient)

    const address = await lockboxClient.getAddress()
    const provider = getProvider(lockboxClient)

    return {
      address,
      provider,
    }
  }
}
