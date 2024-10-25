import type {
  ChainFormatters,
  ExactPartial,
  FeeValuesLegacy,
  Index,
  OneOf,
  Quantity,
  RpcTransactionRequest,
  TransactionRequest,
  TransactionRequestBase,
} from "viem"
import { defineChain, defineTransactionRequest, formatTransactionRequest } from "viem"
import { saigon as saigonViem } from "viem/chains"

type TransactionRequestFreeGas<
  TQuantity = bigint,
  TIndex = number,
  TTransactionType = "free_gas",
> = TransactionRequestBase<TQuantity, TIndex> &
  ExactPartial<FeeValuesLegacy<TQuantity>> & {
    accessList?: never | undefined
    blobs?: undefined
    type?: TTransactionType | undefined
  }

export type RoninTransactionRequest<TQuantity = bigint, TIndex = number> = OneOf<
  TransactionRequest<TQuantity, TIndex> | TransactionRequestFreeGas<TQuantity, TIndex>
>
export type RoninRpcTransactionRequest = OneOf<
  RpcTransactionRequest | TransactionRequestFreeGas<Quantity, Index, "0x64">
>

const roninRpcTransactionType = {
  legacy: "0x0",
  eip2930: "0x1",
  eip1559: "0x2",
  eip4844: "0x3",
  eip7702: "0x4",
  free_gas: "0x64", // https://skymavis.atlassian.net/wiki/spaces/R/pages/159907860/Transaction+pass+POC+documentation
} as const

export const formatters = {
  transactionRequest: defineTransactionRequest({
    format: (request: ExactPartial<RoninTransactionRequest>) => {
      const rpcRequest = formatTransactionRequest(
        request as TransactionRequest,
      ) as RoninRpcTransactionRequest

      if (typeof request.type !== "undefined")
        rpcRequest.type = roninRpcTransactionType[request.type]

      return rpcRequest
    },
  }),
} as const satisfies ChainFormatters

export const saigon = defineChain({ ...saigonViem, formatters })
