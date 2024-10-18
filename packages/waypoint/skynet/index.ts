import { $Fetch, FetchOptions, ofetch } from "ofetch"

import { Paths } from "./paths"

const SKYNET_BASE_URL = "https://api-gateway.skymavis.com/skynet/ronin/web3/v2"

const RequestKey = {
  // Accounts
  searchAccountActivities: "/accounts/{address}/activities/search" as const,
  getNFTsFromAddress: "/accounts/{address}/nfts" as const,
  getBalanceFromAddress: "/accounts/{address}/fungible_tokens" as const,
  getCollectionsFromAddress: "/accounts/{address}/collections" as const,
  getNFTsFromAddressAndContract: "/accounts/{address}/contracts/{contractAddress}/tokens" as const,
  getBalanceFromAddressAndContract: "/accounts/{address}/contracts/{contractAddress}" as const,
  getBalancesFromAddressAndContracts: "/accounts/{address}/contracts" as const,
  getTokenTransfersFromAddress: "/accounts/{address}/tokens/transfers" as const,
  getTokenTransfersFromAddressAndContract:
    "/accounts/{address}/tokens/{contractAddress}/transfers" as const,
  getTransitionsFromAddress: "/accounts/{address}/txs" as const,
  getInternalTransactionTransfersFromAddress: "/accounts/{address}/internal_txs/transfers" as const,

  // Blocks
  getFinalizedBlockNumber: "/blocks/finalized/number" as const,
  getLatestBlockNumber: "/blocks/latest/number" as const,
  getTransactionsByBlockNumber: "/blocks/{blockNumber}/txs" as const,
  getBlockByNumber: "/blocks/{blockNumber}" as const,
  getBlock: "/blocks" as const,

  // Collection
  getNFTOwners: "/collections/{contractAddress}/tokens/{tokenId}/owners" as const,
  getNFTTransfers: "/collections/{contractAddress}/tokens/{tokenId}/transfers" as const,
  getNFTDetails: "/collections/{contractAddress}/tokens/{tokenId}" as const,
  refreshNFTMetadata: "/collections/{contractAddress}/tokens/metadata/refresh_sync" as const,
  refreshNFTMetadataAsync: "/collections/{contractAddress}/tokens/metadata/refresh_async" as const,
  getNFTsDetails: "/collections/{contractAddress}/tokens" as const,
  getNFTsFromCollection: "/collections/{contractAddress}/tokens" as const,
  getTotalCollectionFromAddress: "/collections/{contractAddress}/owners/{address}" as const,
  getOwnersFromCollection: "/collections/{contractAddress}/owners" as const,
  getCollectionTransfers: "/collections/{contractAddress}/transfers" as const,
  getCollectionDetails: "/collections/{contractAddress}" as const,
  getCollectionsDetails: "/collections" as const,

  // Contracts
  getContractDetails: "/contracts/{contractAddress}" as const,
  getContractsDetails: "/contracts" as const,

  // Transactions
  getInternalTransactionsFromTransaction: "/txs/{txHash}/internal_txs" as const,
  getTransactionDetails: "/txs/{txHash}" as const,
  getTransactionsDetails: "/txs/" as const,
} as const

const constructUrl = (path: string, pathParams: Record<string, string>): string => {
  return Object.entries(pathParams).reduce(
    (acc: string, [key, value]) => acc.replace(`{${key}}`, value),
    path,
  )
}

type Method = "get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "trace"

type PathParams<T> = T extends { parameters: { path: infer P } } ? P : never
type QueryParams<T> = T extends { parameters: { query?: infer Q } } ? Q : never
type RequestBody<T> = T extends { requestBody: { content: { "application/json": infer B } } }
  ? B
  : never
type ResponseData<T> = T extends {
  responses: { 200: { content: { "application/json": infer R } } }
}
  ? R
  : never

type RequestParams<M extends Method, T extends keyof Paths> = PathParams<Paths[T][M]> &
  // eslint-disable-next-line @typescript-eslint/ban-types
  (QueryParams<Paths[T][M]> extends never ? {} : { query?: QueryParams<Paths[T][M]> }) &
  // eslint-disable-next-line @typescript-eslint/ban-types
  (RequestBody<Paths[T][M]> extends never ? {} : { body: RequestBody<Paths[T][M]> })

export type SkynetConfig = {
  skynetBaseUrl?: string
  apiKey: string
}

export class Skynet {
  private readonly apiKey: string
  private readonly fetcher: $Fetch

  constructor(config: SkynetConfig) {
    this.apiKey = config.apiKey
    this.fetcher = ofetch.create({
      baseURL: config.skynetBaseUrl ?? SKYNET_BASE_URL,
      headers: {
        "x-api-key": this.apiKey,
      },
    })
  }

  private async apiCall<M extends Method, T extends keyof Paths>(
    method: M,
    path: T,
    params?: RequestParams<M, T>,
  ) {
    let query, body

    if (params && "query" in params) {
      query = params.query
      delete params.query
    }

    if (params && "body" in params) {
      body = params.body
      delete (params as Partial<typeof params>).body
    }

    const url = constructUrl(path, (params ?? {}) as Record<string, string>)
    return this.fetcher<ResponseData<Paths[T][M]>>(url, {
      method,
      query: query as FetchOptions<"json">["query"],
      body: body as FetchOptions<"json">["body"],
    })
  }

  async searchAccountActivities(
    params: RequestParams<"post", typeof RequestKey.searchAccountActivities>,
  ) {
    return this.apiCall("post", RequestKey.searchAccountActivities, params)
  }

  async getNFTsFromAddress(params: RequestParams<"get", typeof RequestKey.getNFTsFromAddress>) {
    return this.apiCall("get", RequestKey.getNFTsFromAddress, params)
  }

  async getBalanceFromAddress(
    params: RequestParams<"get", typeof RequestKey.getBalanceFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getBalanceFromAddress, params)
  }

  async getCollectionsFromAddress(
    params: RequestParams<"get", typeof RequestKey.getCollectionsFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getCollectionsFromAddress, params)
  }

  async getNFTsFromAddressAndContract(
    params: RequestParams<"get", typeof RequestKey.getNFTsFromAddressAndContract>,
  ) {
    return this.apiCall("get", RequestKey.getNFTsFromAddressAndContract, params)
  }

  async getBalanceFromAddressAndContract(
    params: RequestParams<"get", typeof RequestKey.getBalanceFromAddressAndContract>,
  ) {
    return this.apiCall("get", RequestKey.getBalanceFromAddressAndContract, params)
  }

  async getBalancesFromAddressAndContracts(
    params: RequestParams<"post", typeof RequestKey.getBalancesFromAddressAndContracts>,
  ) {
    return this.apiCall("post", RequestKey.getBalancesFromAddressAndContracts, params)
  }

  async getTokenTransfersFromAddress(
    params: RequestParams<"get", typeof RequestKey.getTokenTransfersFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getTokenTransfersFromAddress, params)
  }

  async getTokenTransfersFromAddressAndContract(
    params: RequestParams<"get", typeof RequestKey.getTokenTransfersFromAddressAndContract>,
  ) {
    return this.apiCall("get", RequestKey.getTokenTransfersFromAddressAndContract, params)
  }

  async getTransitionsFromAddress(
    params: RequestParams<"get", typeof RequestKey.getTransitionsFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getTransitionsFromAddress, params)
  }

  async getInternalTransactionTransfersFromAddress(
    params: RequestParams<"get", typeof RequestKey.getInternalTransactionTransfersFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getInternalTransactionTransfersFromAddress, params)
  }

  async getFinalizedBlockNumber() {
    return this.apiCall("get", RequestKey.getFinalizedBlockNumber)
  }

  async getLatestBlockNumber() {
    return this.apiCall("get", RequestKey.getLatestBlockNumber)
  }

  async getTransactionsByBlockNumber(
    params: RequestParams<"get", typeof RequestKey.getTransactionsByBlockNumber>,
  ) {
    return this.apiCall("get", RequestKey.getTransactionsByBlockNumber, params)
  }

  async getBlockByNumber(params: RequestParams<"get", typeof RequestKey.getBlockByNumber>) {
    return this.apiCall("get", RequestKey.getBlockByNumber, params)
  }

  async getBlock(params: RequestParams<"get", typeof RequestKey.getBlock>) {
    return this.apiCall("get", RequestKey.getBlock, params)
  }

  async getNFTOwners(params: RequestParams<"get", typeof RequestKey.getNFTOwners>) {
    return this.apiCall("get", RequestKey.getNFTOwners, params)
  }

  async getNFTTransfers(params: RequestParams<"get", typeof RequestKey.getNFTTransfers>) {
    return this.apiCall("get", RequestKey.getNFTTransfers, params)
  }

  async getNFTDetails(params: RequestParams<"get", typeof RequestKey.getNFTDetails>) {
    return this.apiCall("get", RequestKey.getNFTDetails, params)
  }

  async refreshNFTMetadata(params: RequestParams<"post", typeof RequestKey.refreshNFTMetadata>) {
    return this.apiCall("post", RequestKey.refreshNFTMetadata, params)
  }

  async refreshNFTMetadataAsync(
    params: RequestParams<"post", typeof RequestKey.refreshNFTMetadataAsync>,
  ) {
    return this.apiCall("post", RequestKey.refreshNFTMetadataAsync, params)
  }

  async getNFTsDetails(params: RequestParams<"post", typeof RequestKey.getNFTsDetails>) {
    return this.apiCall("post", RequestKey.getNFTsDetails, params)
  }

  async getNFTsFromCollection(
    params: RequestParams<"get", typeof RequestKey.getNFTsFromCollection>,
  ) {
    return this.apiCall("get", RequestKey.getNFTsFromCollection, params)
  }

  async getTotalCollectionFromAddress(
    params: RequestParams<"get", typeof RequestKey.getTotalCollectionFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getTotalCollectionFromAddress, params)
  }

  async getOwnersFromCollection(
    params: RequestParams<"get", typeof RequestKey.getOwnersFromCollection>,
  ) {
    return this.apiCall("get", RequestKey.getOwnersFromCollection, params)
  }

  async getCollectionTransfers(
    params: RequestParams<"get", typeof RequestKey.getCollectionTransfers>,
  ) {
    return this.apiCall("get", RequestKey.getCollectionTransfers, params)
  }

  async getCollectionDetails(params: RequestParams<"get", typeof RequestKey.getCollectionDetails>) {
    return this.apiCall("get", RequestKey.getCollectionDetails, params)
  }

  async getCollectionsDetails(
    params: RequestParams<"post", typeof RequestKey.getCollectionsDetails>,
  ) {
    return this.apiCall("post", RequestKey.getCollectionsDetails, params)
  }

  async getContractDetails(params: RequestParams<"get", typeof RequestKey.getContractDetails>) {
    return this.apiCall("get", RequestKey.getContractDetails, params)
  }

  async getContractsDetails(params: RequestParams<"post", typeof RequestKey.getContractsDetails>) {
    return this.apiCall("post", RequestKey.getContractsDetails, params)
  }

  async getInternalTransactionsFromTransaction(
    params: RequestParams<"get", typeof RequestKey.getInternalTransactionsFromTransaction>,
  ) {
    return this.apiCall("get", RequestKey.getInternalTransactionsFromTransaction, params)
  }

  async getTransactionDetails(
    params: RequestParams<"get", typeof RequestKey.getTransactionDetails>,
  ) {
    return this.apiCall("get", RequestKey.getTransactionDetails, params)
  }

  async getTransactionsDetails(
    params: RequestParams<"post", typeof RequestKey.getTransactionsDetails>,
  ) {
    return this.apiCall("post", RequestKey.getTransactionsDetails, params)
  }
}
