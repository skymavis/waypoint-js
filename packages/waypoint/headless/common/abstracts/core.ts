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
import { HeadlessCommonClientError, HeadlessCommonClientErrorCode } from "../error/client"
import { TransactionParams } from "../transaction/common"
import { BaseServiceEnv } from "../utils/service-url"

export type CreateAbstractHeadlessCore<
  ServiceEnv extends object = object,
  Extra extends object | unknown = unknown,
> = {
  readonly chainId: number
  overrideRpcUrl?: string
  waypointToken?: string
  clientShard?: string
  serviceEnv?: BaseServiceEnv<ServiceEnv>
} & Extra

export abstract class AbstractHeadlessCore<
  ServiceEnv extends object = object,
  Extra extends object | unknown = unknown,
> {
  protected readonly chainId: number
  protected rpcUrl: string
  protected publicClient: Client

  protected waypointToken: string
  protected clientShard: string

  protected constructor(opts: CreateAbstractHeadlessCore<ServiceEnv, Extra>) {
    const { chainId, overrideRpcUrl, waypointToken = "", clientShard = "" } = opts

    this.chainId = chainId
    this.waypointToken = waypointToken
    this.clientShard = clientShard

    if (overrideRpcUrl) {
      this.rpcUrl = overrideRpcUrl
      this.publicClient = createClient({
        transport: http(overrideRpcUrl),
      })
    } else {
      const rpcUrl = VIEM_CHAIN_MAPPING[chainId]?.rpcUrls?.default?.http[0]

      if (!rpcUrl) {
        throw new HeadlessCommonClientError({
          cause: undefined,
          code: HeadlessCommonClientErrorCode.UnsupportedChainIdError,
          message: `Unsupported chain. Unable to find rpcUrl for chainId="${chainId}". Please provide an "overrideRpcUrl" parameter.`,
        })
      }

      this.rpcUrl = rpcUrl
      this.publicClient = createClient({
        chain: VIEM_CHAIN_MAPPING[chainId],
        transport: http(),
      })
    }
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

  static create<
    ServiceEnv extends object = object,
    Extra extends object | unknown = unknown,
    T extends AbstractHeadlessCore<ServiceEnv, Extra> = AbstractHeadlessCore<ServiceEnv, Extra>,
  >(
    this: new (opts: CreateAbstractHeadlessCore<ServiceEnv, Extra>) => T,
    opts: CreateAbstractHeadlessCore<ServiceEnv, Extra>,
  ): T {
    return new this(opts)
  }

  abstract genMpc: () => Promise<unknown>

  abstract getUserProfile: () => Promise<unknown>

  abstract getAddress: () => Promise<Address> | Address

  abstract signMessage: (message: SignableMessage) => Promise<Hex>

  abstract signTypedData: (typedData: TypedDataDefinition) => Promise<Hex>

  abstract sendTransaction: (transaction: TransactionParams) => Promise<{
    txHash: Hash
  }>

  abstract validateSponsorTx: (transaction: TransactionParams) => Promise<unknown>

  abstract isSignable: () => Promise<boolean> | boolean | Promise<Address>
}
