// import { type GenericTransaction, Lockbox, type LockboxProvider } from "@axieinfinity/lockbox"
// import { type Address } from "viem"

// import { RONIN_GAS_SPONSOR_TYPE } from "../action/send-transaction/common"
// import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
// import { _defaultShardStorage, type ClientShardStorage } from "./shard-storage"

// type TrackParams = {
//   enable: boolean
//   timeout: number
// }
// type WasmParams = {
//   trackParams: TrackParams
//   timeout: number
//   optionalParams: string
// }
// export type _LockboxConfig = {
//   chainId: number
//   overrideRpcUrl?: string
//   wasmUrl?: string
//   wasmParams?: WasmParams
// }
// export type CreateHeadlessClientOpts = _LockboxConfig & {
//   storage?: ClientShardStorage
// }

// export type BaseParams = {
//   waypointToken: string
// }
// export type ConnectParam = BaseParams & {
//   recoveryPassword: string
// }
// export type ReconnectParams = BaseParams
// export type ValidateSponsorTxParams = BaseParams & {
//   txRequest: GenericTransaction
// }

// export class HeadlessClient {
//   private lockbox: Lockbox
//   private storage: ClientShardStorage
//   private provider?: LockboxProvider
//   private address?: Address

//   protected constructor(config: _LockboxConfig, storage: ClientShardStorage) {
//     try {
//       this.lockbox = Lockbox.init(config)
//     } catch (error) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.InitHeadlessClientError,
//         message: "could NOT init HeadlessClient",
//         cause: error,
//       })
//     }

//     this.storage = storage
//   }

//   static create = (opts: CreateHeadlessClientOpts) => {
//     const { storage, ...lockboxConfig } = opts
//     return new HeadlessClient(lockboxConfig, storage ?? _defaultShardStorage)
//   }

//   private getBackupClientShard = async () => {
//     const { lockbox } = this

//     try {
//       const { key } = await lockbox.getBackupClientShard()

//       return key
//     } catch (error) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.GetBackupClientShardError,
//         message: "could NOT get backup client shard",
//         cause: error,
//       })
//     }
//   }

//   private decryptClientShard = async (backupShard: string, recoveryPassword: string) => {
//     const { lockbox } = this

//     try {
//       return await lockbox.decryptClientShard(backupShard, recoveryPassword)
//     } catch (error) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.DecryptClientShardError,
//         message: "could NOT decrypt client shard",
//         cause: error,
//       })
//     }
//   }

//   private validateSignature = async () => {
//     const { lockbox } = this

//     try {
//       await lockbox.signMessage("test")

//       return true
//     } catch (error) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.KeylessValidationError,
//         message: "could NOT validate keyless wallet signature",
//         cause: error,
//       })
//     }
//   }

//   private getLockboxProvider = () => {
//     const { lockbox } = this

//     try {
//       return lockbox.getProvider()
//     } catch (error) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.GetLockboxProviderError,
//         message: "could NOT initialize provider",
//         cause: error,
//       })
//     }
//   }

//   isConnected = () => {
//     return !!this.provider && !!this.address
//   }

//   getAddress = () => {
//     if (!this.address) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.ClientIsNotConnectedError,
//         message: "address is NOT available",
//         cause: undefined,
//       })
//     }

//     return this.address
//   }

//   getProvider = () => {
//     if (!this.provider) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.ClientIsNotConnectedError,
//         message: "provider is NOT available",
//         cause: undefined,
//       })
//     }

//     return this.provider
//   }

//   connect = async (params: ConnectParam) => {
//     const { recoveryPassword, waypointToken } = params
//     const {
//       lockbox,
//       storage,
//       getBackupClientShard,
//       decryptClientShard,
//       validateSignature,
//       getLockboxProvider,
//     } = this

//     lockbox.setAccessToken(waypointToken)

//     const backupShard = await getBackupClientShard()
//     const clientShard = await decryptClientShard(backupShard, recoveryPassword)
//     await validateSignature()
//     const address = await lockbox.getAddress()
//     const provider = getLockboxProvider()

//     storage.set(clientShard)
//     this.provider = provider
//     this.address = address

//     return {
//       address,
//       provider,
//     }
//   }

//   reconnect = async (params: ReconnectParams) => {
//     const { waypointToken } = params
//     const { lockbox, storage, validateSignature, getLockboxProvider } = this

//     const clientShard = storage.get()
//     if (!clientShard) {
//       throw new HeadlessClientError({
//         code: HeadlessClientErrorCode.InvalidClientShardError,
//         message: "The client shard is NOT valid.",
//         cause: undefined,
//       })
//     }

//     lockbox.setClientShard(clientShard)
//     lockbox.setAccessToken(waypointToken)

//     await validateSignature()
//     const address = await lockbox.getAddress()
//     const provider = getLockboxProvider()

//     this.provider = provider
//     this.address = address
//     return {
//       address,
//       provider,
//     }
//   }

//   validateSponsorTx = (params: ValidateSponsorTxParams) => {
//     const { txRequest, waypointToken } = params
//     const { lockbox } = this

//     const sponsorTx: GenericTransaction = {
//       ...txRequest,
//       type: RONIN_GAS_SPONSOR_TYPE,
//     }

//     lockbox.setAccessToken(waypointToken)
//     return lockbox.validateSponsorTx(sponsorTx)
//   }
// }
