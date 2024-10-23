import { Lockbox } from "@axieinfinity/lockbox"

import { GetKeylessProviderError } from "./error"

export type TrackParams = {
  enable: boolean
  timeout: number
}

export type WasmParams = {
  trackParams: TrackParams
  timeout: number
  optionalParams: string
}

export type GetKeylessProviderOpts = {
  chainId: number
  waypointToken: string
  overrideRpcUrl?: string

  wasmUrl?: string
  wasmParams?: WasmParams

  recoveryPassword: string
}

const initLockbox = (opts: GetKeylessProviderOpts) => {
  const { chainId, waypointToken, overrideRpcUrl, wasmUrl, wasmParams } = opts

  try {
    return Lockbox.init({
      chainId,
      accessToken: waypointToken,
      overrideRpcUrl,
      wasmUrl,
      wasmParams,
    })
  } catch (error) {
    throw new GetKeylessProviderError(error, {
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
    throw new GetKeylessProviderError(error, {
      code: -200,
      shortMessage: "could NOT get backup client shard",
    })
  }
}

/**
 * @deprecated switch to waypoint/headless
 */
export const getKeylessProvider = async (opts: GetKeylessProviderOpts) => {
  const { recoveryPassword } = opts

  const lockboxClient = initLockbox(opts)
  const clientShard = await getBackupClientShard(lockboxClient)

  try {
    await lockboxClient.decryptClientShard(clientShard, recoveryPassword)
  } catch (error) {
    throw new GetKeylessProviderError(error, {
      code: -300,
      shortMessage: "could NOT decrypt client shard",
    })
  }

  try {
    return lockboxClient.getProvider()
  } catch (error) {
    throw new GetKeylessProviderError(error, {
      code: -400,
      shortMessage: "could NOT initialize provider",
    })
  }
}
