import { HeadlessV1ServiceEnv } from "../../common"
import { TransactionParams } from "../../common/transaction/common"
import { HeadlessV1Core } from "./core"

export type CreateHeadlessV1ClientOpts = {
  chainId: number
  overrideRpcUrl?: string

  serviceEnv?: HeadlessV1ServiceEnv
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

export class HeadlessV1Client {
  private core: HeadlessV1Core

  protected constructor(opts: CreateHeadlessV1ClientOpts) {
    const { chainId, overrideRpcUrl, wasmUrl, serviceEnv = "prod" } = opts

    this.core = new HeadlessV1Core({
      chainId,
      overrideRpcUrl,
      wasmUrl,
      serviceEnv,
    })
  }

  static create = (opts: CreateHeadlessV1ClientOpts) => {
    return new HeadlessV1Client(opts)
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
