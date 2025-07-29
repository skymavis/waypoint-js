import { TransactionParams } from "../../headless-common-helper/transaction/common"
import { ServiceEnv } from "../../headless-common-helper/utils/service-url"
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

  connect = (params: ConnectParams) => {
    const { clientShard, waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)
    core.setClientShard(clientShard)

    const address = core.getAddress()
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
    const address = core.getAddress()
    const provider = core.getProvider()

    return {
      address,
      provider,
      clientShard,
    }
  }

  isSignable = () => {
    return this.core.isSignable()
  }

  getAddress = () => {
    return this.core.getAddress()
  }

  getProvider = () => {
    return this.core.getProvider()
  }

  getUserProfile = () => {
    return this.core.getUserProfile()
  }

  validateSponsorTx = (transaction: TransactionParams) => {
    return this.core.validateSponsorTx(transaction)
  }
}
