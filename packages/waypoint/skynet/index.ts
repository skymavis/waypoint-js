/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { $Fetch, FetchOptions, ofetch } from "ofetch"

import { Paths } from "./paths"

const SKYNET_BASE_URL = "https://api-gateway.skymavis.com/skynet/ronin/web3/v2"

const RequestKey = {
  getBalanceFromAddress: "/accounts/{address}/fungible_tokens" as const,
  getNFTsFromAddress: "/accounts/{address}/nfts" as const,
  getCollectionsFromAddress: "/accounts/{address}/collections" as const,
  getNFTsFromAddressAndContract: "/accounts/{address}/contracts/{contractAddress}/tokens" as const,
  getBalanceFromAddressAndContract: "/accounts/{address}/contracts/{contractAddress}" as const,
  getNFTOwners: "/collections/{contractAddress}/tokens/{tokenId}/owners" as const,
  getNFTDetails: "/collections/{contractAddress}/tokens/{tokenId}" as const,
  refreshNFTMetadata: "/collections/{contractAddress}/tokens/metadata/refresh_sync" as const,
  refreshNFTMetadataAsync: "/collections/{contractAddress}/tokens/metadata/refresh_async" as const,
  getNFTsDetails: "/collections/{contractAddress}/tokens" as const,
  getNFTsFromCollection: "/collections/{contractAddress}/tokens" as const,
  getOwnersFromCollection: "/collections/{contractAddress}/owners" as const,
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
  (QueryParams<Paths[T][M]> extends never ? {} : { query?: QueryParams<Paths[T][M]> }) &
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
    params: RequestParams<M, T>,
  ) {
    let query, body

    if ("query" in params) {
      query = params.query
      delete params.query
    }

    if ("body" in params) {
      body = params.body
      delete (params as Partial<typeof params>).body
    }

    const url = constructUrl(path, params as Record<string, string>)
    return this.fetcher<ResponseData<Paths[T][M]>>(url, {
      method,
      query: query as FetchOptions<"json">["query"],
      body: body as FetchOptions<"json">["body"],
    })
  }

  async getBalanceFromAddress(
    params: RequestParams<"get", typeof RequestKey.getBalanceFromAddress>,
  ) {
    return this.apiCall("get", RequestKey.getBalanceFromAddress, params)
  }

  async getNFTsFromAddress(params: RequestParams<"get", typeof RequestKey.getNFTsFromAddress>) {
    return this.apiCall("get", RequestKey.getNFTsFromAddress, params)
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

  async getNFTOwners(params: RequestParams<"get", typeof RequestKey.getNFTOwners>) {
    return this.apiCall("get", RequestKey.getNFTOwners, params)
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

  async getOwnersFromCollection(
    params: RequestParams<"get", typeof RequestKey.getOwnersFromCollection>,
  ) {
    return this.apiCall("get", RequestKey.getOwnersFromCollection, params)
  }
}
