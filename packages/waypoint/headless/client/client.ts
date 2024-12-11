import { TransactionParams } from "../action/send-transaction/common"
import { ServiceEnv } from "../utils/service-url"
import { HeadlessCore } from "./core"

export type CreateHeadlessClientOpts = {
  chainId: number
  overrideRpcUrl?: string

  serviceEnv?: ServiceEnv
  wasmUrl?: string
}

type BaseParams = {
  waypointToken: string
}
type ConnectParams = BaseParams & {
  clientShard: string
}
type ConnectWithPasswordParams = BaseParams & {
  recoveryPassword: string
}
type ValidateSponsorTxParams = BaseParams & {
  txRequest: TransactionParams
}

export class HeadlessClient {
  private core: HeadlessCore

  protected constructor(opts: CreateHeadlessClientOpts) {
    const { chainId, overrideRpcUrl, wasmUrl, serviceEnv = "prod" } = opts

    this.core = HeadlessCore.create({
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
    return this.core.isSignable()
  }

  getAddress = () => {
    return this.core.getAddressFromClientShard()
  }

  getProvider = () => {
    return this.core.getProvider()
  }

  connect = (params: ConnectParams) => {
    const { clientShard, waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)
    core.setClientShard(clientShard)

    const address = core.getAddressFromClientShard()
    const provider = core.getProvider()

    return {
      address,
      provider,
    }
  }

  connectWithPassword = async (params: ConnectWithPasswordParams) => {
    const { recoveryPassword, waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)

    const { key: backupShard } = await core.getBackupClientShard()
    const clientShard = await core.decryptClientShard(backupShard, recoveryPassword)
    const address = core.getAddressFromClientShard()
    const provider = core.getProvider()

    return {
      address,
      provider,
      clientShard,
    }
  }

  validateSponsorTx = (params: ValidateSponsorTxParams) => {
    const { txRequest, waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)
    return core.validateSponsorTx(txRequest)
  }
}
