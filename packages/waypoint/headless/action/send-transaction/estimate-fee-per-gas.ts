import { Client, Hex, numberToHex } from "viem"
import { getGasPrice } from "viem/actions"
import { ronin, saigon } from "viem/chains"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { request } from "../helpers/request/request"
import { RequestRoute } from "../helpers/request/types"
import { isEIP1559CompatibleTransaction } from "../helpers/tx-type-check"
import { SupportedTransactionType } from "./common"

const GAS_SUGGESTION_ROUTES: Record<number, RequestRoute> = {
  [ronin.id]: "get https://wallet-manager.skymavis.com/proxy/public/v1/ronin/gas-suggestion",
  [saigon.id]:
    "get https://wallet-manager-stg.skymavis.one/proxy/public/v1/ronin-testnet/gas-suggestion",
} as const

const GAS_PRICE_BUFFER_PERCENTAGE = 2 // 2%

const applyBuffer = (value: bigint, percentage: number): bigint =>
  (value * BigInt(100 + percentage)) / 100n

interface GasSuggestionResponse {
  base_fee_per_gas: bigint
  exact_base_fee: bigint
  low: GasPriceLevel
  medium: GasPriceLevel
  high: GasPriceLevel
}

interface GasPriceLevel {
  max_priority_fee_per_gas: bigint
  max_fee_per_gas: bigint
}

export interface EstimateFeesPerGasReturnType {
  gasPrice: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
}

interface EstimateFeesPerGasParams {
  chainId: number
  type: SupportedTransactionType
  gasPrice?: Hex
  maxFeePerGas?: Hex
  maxPriorityFeePerGas?: Hex
}

const fetchEIP1559GasSuggestion = async (chainId: number): Promise<GasSuggestionResponse> => {
  const route = GAS_SUGGESTION_ROUTES[chainId]
  if (!route)
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: `Unsupported chain: ${chainId}.`,
    })

  const { data } = await request<GasSuggestionResponse>(route)
  if (!data)
    throw new HeadlessClientError({
      cause: undefined,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: "Empty gas suggestion response.",
    })

  return data
}

const handleEIP1559Transaction = async (
  params: EstimateFeesPerGasParams,
): Promise<EstimateFeesPerGasReturnType> => {
  const { chainId, maxFeePerGas, maxPriorityFeePerGas } = params

  if (maxFeePerGas && maxPriorityFeePerGas) {
    return {
      gasPrice: "0x0",
      maxFeePerGas,
      maxPriorityFeePerGas,
    }
  }

  const gasSuggestion = await fetchEIP1559GasSuggestion(chainId)
  const { max_priority_fee_per_gas, max_fee_per_gas } = gasSuggestion.medium

  return {
    gasPrice: "0x0",
    maxPriorityFeePerGas: numberToHex(max_priority_fee_per_gas),
    maxFeePerGas: numberToHex(max_fee_per_gas),
  }
}

const handleLegacyTransaction = async (
  client: Client,
  gasPrice?: Hex,
): Promise<EstimateFeesPerGasReturnType> => {
  if (gasPrice) {
    return {
      gasPrice,
      maxPriorityFeePerGas: "0x0",
      maxFeePerGas: "0x0",
    }
  }

  const baseGasPrice = await getGasPrice(client)
  const bufferedGasPrice = applyBuffer(baseGasPrice, GAS_PRICE_BUFFER_PERCENTAGE)

  return {
    gasPrice: numberToHex(bufferedGasPrice),
    maxPriorityFeePerGas: "0x0",
    maxFeePerGas: "0x0",
  }
}

export async function estimateFeesPerGas(
  client: Client,
  params: EstimateFeesPerGasParams,
): Promise<EstimateFeesPerGasReturnType> {
  const { type, gasPrice } = params

  try {
    if (isEIP1559CompatibleTransaction(type)) return await handleEIP1559Transaction(params)
    return await handleLegacyTransaction(client, gasPrice)
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.PrepareTransactionError,
      message: "Failed to estimate gas price. This could be due to network issues or RPC problems.",
    })
  }
}
