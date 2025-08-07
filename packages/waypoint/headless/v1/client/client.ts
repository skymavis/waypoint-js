import { ServiceEnv } from "../../common"
import { TransactionParams } from "../../common/transaction/common"
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

    this.core = new HeadlessCore({
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

    return {
      address,
    }
  }

  connectWithPassword = async (params: ConnectWithPasswordParams) => {
    const { recoveryPassword, waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)

    const { key: backupShard } = await core.getBackupClientShard()
    const clientShard = await core.decryptClientShard(backupShard, recoveryPassword)
    const address = core.getAddress()

    return {
      address,
      clientShard,
    }
  }

  isSignable = () => {
    return this.core.isSignable()
  }

  getAddress = () => {
    return this.core.getAddress()
  }

  getUserProfile = () => {
    return this.core.getUserProfile()
  }

  validateSponsorTx = (transaction: TransactionParams) => {
    return this.core.validateSponsorTx(transaction)
  }

  getCore = () => {
    return this.core
  }
}
