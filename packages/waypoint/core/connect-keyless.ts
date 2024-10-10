import { Lockbox } from "@axieinfinity/lockbox"

import { ConnectError } from "./error"

export type TrackParams = {
  enable: boolean
  timeout: number
}

export type WasmParams = {
  trackParams: TrackParams
  timeout: number
  optionalParams: string
}

export type Opts = {
  chainId: number
  waypointToken: string
  overrideRpcUrl?: string

  wasmUrl?: string
  wasmParams?: WasmParams

  recoveryPassword: string
}

const initLockbox = (opts: Opts) => {
  const { chainId, waypointToken, overrideRpcUrl, wasmUrl, wasmParams } = opts

  try {
    return Lockbox.init({
      chainId: chainId,
      accessToken: waypointToken,
      overrideRpcUrl,
      wasmUrl,
      wasmParams,
    })
  } catch (error) {
    throw new ConnectError(error, {
      code: -100,
      shortMessage: "could NOT initialize lockbox client",
    })
  }
}

const getBackupClientShard = async (lockboxClient: Lockbox) => {
  try {
    const { key } = await lockboxClient.getBackupClientShard()

    return key
  } catch (error) {
    throw new ConnectError(error, { code: -200, shortMessage: "could NOT get backup client shard" })
  }
}

export const connectKeyless = async (opts: Opts) => {
  const { recoveryPassword } = opts

  const lockboxClient = initLockbox(opts)
  const clientsShard = await getBackupClientShard(lockboxClient)

  try {
    await lockboxClient.decryptClientShard(clientsShard, recoveryPassword)
  } catch (error) {
    throw new ConnectError(error, { code: -300, shortMessage: "could NOT decrypt client shard" })
  }

  try {
    return lockboxClient.getProvider()
  } catch (error) {
    throw new ConnectError(error, { code: -400, shortMessage: "could NOT initialize provider" })
  }
}
