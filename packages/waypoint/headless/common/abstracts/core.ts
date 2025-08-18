import {
  Address,
  Client,
  createClient,
  Hash,
  Hex,
  http,
  SignableMessage,
  TypedDataDefinition,
} from "viem"

import { VIEM_CHAIN_MAPPING } from "../../../common"
import { ValidateSponsorTransactionResult } from "../../v1"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { TransactionParams } from "../transaction/common"

export type CreateAbstractHeadlessCoreOpts<ExtraOptions extends object = object> = {
  readonly chainId: number
  overrideRpcUrl?: string
  waypointToken?: string
  clientShard?: string
} & ExtraOptions

export abstract class AbstractHeadlessCore<ExtraOptions extends object = object> {
  protected readonly chainId: number
  protected readonly rpcUrl: string
  protected publicClient: Client

  protected waypointToken: string
  protected clientShard: string

  public constructor(opts: CreateAbstractHeadlessCoreOpts<ExtraOptions>) {
    const { chainId, overrideRpcUrl, waypointToken = "", clientShard = "" } = opts

    this.chainId = chainId
    this.waypointToken = waypointToken
    this.clientShard = clientShard
    const rpcUrl = overrideRpcUrl ?? VIEM_CHAIN_MAPPING[chainId]?.rpcUrls?.default?.http[0]

    if (!rpcUrl) {
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.UnsupportedChainIdError,
        message: `Unsupported chain. Unable to find rpcUrl for chainId="${chainId}". Please provide an "overrideRpcUrl" parameter.`,
      })
    }

    this.rpcUrl = rpcUrl
    this.publicClient = createClient({
      chain: VIEM_CHAIN_MAPPING[chainId],
      transport: http(rpcUrl),
    })
  }

  setWaypointToken = (waypointToken: string) => {
    this.waypointToken = waypointToken
  }

  setClientShard = (clientShard: string) => {
    this.clientShard = clientShard
  }

  getChainId = () => {
    return this.chainId
  }

  getPublicClient = () => {
    return this.publicClient
  }

  abstract genMpc: () => Promise<object | string>

  abstract getUserProfile: () => Promise<
    {
      address: Address
      uuid: string
    } & Record<string, unknown>
  >

  abstract getAddress: () => Address | null

  abstract signMessage: (message: SignableMessage) => Promise<Hex>

  abstract signTypedData: (data: TypedDataDefinition | string) => Promise<Hex>

  abstract sendTransaction: (transaction: TransactionParams) => Promise<{
    txHash: Hash
  }>

  abstract validateSponsorTx: (
    transaction: TransactionParams,
  ) => Promise<ValidateSponsorTransactionResult>

  abstract isSignable: () => boolean
}
