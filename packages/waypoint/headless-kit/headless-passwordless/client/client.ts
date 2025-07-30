import { TransactionParams } from "../../headless-common-helper/transaction/common"
import { PasswordlessServiceEnv } from "../../headless-common-helper/utils/service-url"
import { HeadlessPasswordlessCore } from "./core"

export type CreateHeadlessPasswordlessClientOpts = {
  chainId: number
  overrideRpcUrl?: string

  serviceEnv?: PasswordlessServiceEnv
}

type BaseParams = {
  waypointToken: string
}
type MigratableParams = BaseParams & {
  clientShard: string
}

export class HeadlessPasswordlessClient {
  private core: HeadlessPasswordlessCore

  protected constructor(opts: CreateHeadlessPasswordlessClientOpts) {
    const { chainId, overrideRpcUrl, serviceEnv = "prod" } = opts

    this.core = HeadlessPasswordlessCore.create({
      chainId,
      overrideRpcUrl,
      serviceEnv,
    })
  }

  static create = (opts: CreateHeadlessPasswordlessClientOpts) => {
    return new HeadlessPasswordlessClient(opts)
  }

  connect = (params: BaseParams) => {
    const { waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)

    const address = core.getAddress()
    const provider = core.getProvider()

    return {
      address,
      provider,
    }
  }

  connectWithMigratable = async (params: MigratableParams) => {
    const { clientShard, waypointToken } = params
    const { core } = this

    core.setWaypointToken(waypointToken)
    core.setClientShard(clientShard)

    const address = core.getAddress()
    const provider = core.getProvider()

    return {
      address,
      provider,
      clientShard,
    }
  }

  isSignable = async () => {
    return this.core.getAddress()
  }

  getAddress = async () => {
    return this.core.getAddress()
  }

  getProvider = () => {
    return this.core.getProvider()
  }

  getUserProfile = async () => {
    return this.core.getUserProfile()
  }

  validateSponsorTx = (transaction: TransactionParams) => {
    return this.core.validateSponsorTx(transaction)
  }
}
