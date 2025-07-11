import { createPublicClient, http, numberToHex } from "viem"
import { estimateFeesPerGas as viemEstimateFeesPerGas, getGasPrice } from "viem/actions"
import { ronin, saigon } from "viem/chains"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { request } from "../../../../headless/action/helpers/request/request"
import { isEIP1559CompatibleTransaction } from "../../../../headless/action/helpers/tx-type-check"
import { SupportedTransaction } from "../../../../headless/action/send-transaction/common"
import {
  applyBuffer,
  estimateFeesPerGas,
  EstimateFeesPerGasParams,
  GAS_PRICE_BUFFER_PERCENTAGE,
  GAS_SUGGESTION_ROUTES,
  GasSuggestionResponse,
} from "../../../../headless/action/send-transaction/estimate-fee-per-gas"

vi.mock("../../../../headless/action/helpers/request/request", () => ({
  request: vi.fn(),
}))

vi.mock("viem/actions", () => ({
  getGasPrice: vi.fn(),
  estimateFeesPerGas: vi.fn(),
}))

vi.mock("../../../../headless/action/helpers/tx-type-check", () => ({
  isEIP1559CompatibleTransaction: vi.fn().mockReturnValue(false),
}))

const mockRequest = vi.mocked(request)
const mockGetGasPrice = vi.mocked(getGasPrice)
const mockViemEstimateFeesPerGas = vi.mocked(viemEstimateFeesPerGas)
const mockIsEIP1559CompatibleTransaction = vi.mocked(isEIP1559CompatibleTransaction)

describe("estimate-fee-per-gas", () => {
  let mockClient: ReturnType<typeof createPublicClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createPublicClient({
      chain: ronin,
      transport: http(),
    })
  })

  describe("applyBuffer", () => {
    test("should apply buffer percentage correctly", () => {
      const value = 1000n
      const percentage = 10
      const result = applyBuffer(value, percentage)
      expect(result).toBe(1100n)
    })

    test("should handle fractional results correctly", () => {
      const value = 101n
      const percentage = 2
      const result = applyBuffer(value, percentage)
      expect(result).toBe(103n)
    })
  })

  describe("estimateFeesPerGas", () => {
    const mockGasSuggestion: GasSuggestionResponse = {
      base_fee_per_gas: 20000000000n,
      exact_base_fee: 20000000000n,
      low: {
        max_priority_fee_per_gas: 1000000000n,
        max_fee_per_gas: 21000000000n,
      },
      medium: {
        max_priority_fee_per_gas: 2000000000n,
        max_fee_per_gas: 22000000000n,
      },
      high: {
        max_priority_fee_per_gas: 3000000000n,
        max_fee_per_gas: 23000000000n,
      },
    }

    describe("EIP1559 transactions", () => {
      beforeEach(() => {
        mockIsEIP1559CompatibleTransaction.mockReturnValue(true)
      })

      test("should return provided maxFeePerGas and maxPriorityFeePerGas when both are provided", async () => {
        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
          maxFeePerGas: "0x5208",
          maxPriorityFeePerGas: "0x3e8",
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(result).toEqual({
          gasPrice: "0x0",
          maxFeePerGas: "0x5208",
          maxPriorityFeePerGas: "0x3e8",
        })
        expect(mockRequest).not.toHaveBeenCalled()
      })

      test("should fetch gas suggestion when maxFeePerGas or maxPriorityFeePerGas is not provided", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: mockGasSuggestion,
          error: undefined,
        })

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(mockRequest).toHaveBeenCalledWith(GAS_SUGGESTION_ROUTES[ronin.id])
        expect(result).toEqual({
          gasPrice: "0x0",
          maxPriorityFeePerGas: numberToHex(mockGasSuggestion.medium.max_priority_fee_per_gas),
          maxFeePerGas: numberToHex(mockGasSuggestion.medium.max_fee_per_gas),
        })
      })

      test("should use provided maxFeePerGas and fetch maxPriorityFeePerGas", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: mockGasSuggestion,
          error: undefined,
        })

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
          maxFeePerGas: "0x5208",
        }

        const result = await estimateFeesPerGas(mockClient, params)
        expect(mockRequest).toHaveBeenCalledWith(GAS_SUGGESTION_ROUTES[ronin.id])

        expect(result).toEqual({
          gasPrice: "0x0",
          maxPriorityFeePerGas: numberToHex(mockGasSuggestion.medium.max_priority_fee_per_gas),
          maxFeePerGas: "0x5208",
        })
      })

      test("should use provided maxPriorityFeePerGas and fetch maxFeePerGas", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: mockGasSuggestion,
          error: undefined,
        })

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
          maxPriorityFeePerGas: "0x3e8",
        }

        const result = await estimateFeesPerGas(mockClient, params)
        expect(mockRequest).toHaveBeenCalledWith(GAS_SUGGESTION_ROUTES[ronin.id])

        expect(result).toEqual({
          gasPrice: "0x0",
          maxPriorityFeePerGas: "0x3e8",
          maxFeePerGas: numberToHex(mockGasSuggestion.medium.max_fee_per_gas),
        })
      })

      test("should use saigon testnet endpoint for saigon chain", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: mockGasSuggestion,
          error: undefined,
        })

        const params: EstimateFeesPerGasParams = {
          chainId: saigon.id,
          type: SupportedTransaction.EIP1559,
        }

        await estimateFeesPerGas(mockClient, params)

        expect(mockRequest).toHaveBeenCalledWith(GAS_SUGGESTION_ROUTES[saigon.id])
      })

      test("should fallback to viem estimateFeesPerGas when API request fails", async () => {
        const requestError = new Error("API request failed")
        mockRequest.mockRejectedValue(requestError)

        const viemResult = {
          maxFeePerGas: 25000000000n,
          maxPriorityFeePerGas: 2000000000n,
        }
        mockViemEstimateFeesPerGas.mockResolvedValue(viemResult)

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(mockViemEstimateFeesPerGas).toHaveBeenCalledWith(mockClient)
        expect(result).toEqual({
          gasPrice: "0x0",
          maxPriorityFeePerGas: numberToHex(viemResult.maxPriorityFeePerGas),
          maxFeePerGas: numberToHex(viemResult.maxFeePerGas),
        })
      })

      test("should fallback to viem estimateFeesPerGas when response data is empty", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: undefined,
          error: undefined,
        })

        const viemResult = {
          maxFeePerGas: 25000000000n,
          maxPriorityFeePerGas: 2000000000n,
        }
        mockViemEstimateFeesPerGas.mockResolvedValue(viemResult)

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(mockViemEstimateFeesPerGas).toHaveBeenCalledWith(mockClient)
        expect(result).toEqual({
          gasPrice: "0x0",
          maxPriorityFeePerGas: numberToHex(viemResult.maxPriorityFeePerGas),
          maxFeePerGas: numberToHex(viemResult.maxFeePerGas),
        })
      })
    })

    describe("Legacy transactions", () => {
      beforeEach(() => {
        mockIsEIP1559CompatibleTransaction.mockReturnValue(false)
      })

      test("should return provided gasPrice when provided", async () => {
        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.Legacy,
          gasPrice: "0x5208",
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(result).toEqual({
          gasPrice: "0x5208",
          maxPriorityFeePerGas: "0x0",
          maxFeePerGas: "0x0",
        })
        expect(mockGetGasPrice).not.toHaveBeenCalled()
      })

      test("should fetch and buffer gas price when not provided", async () => {
        const baseGasPrice = 20000000000n
        const expectedBufferedGasPrice = applyBuffer(baseGasPrice, GAS_PRICE_BUFFER_PERCENTAGE)
        mockGetGasPrice.mockResolvedValue(baseGasPrice)

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.Legacy,
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(mockGetGasPrice).toHaveBeenCalledWith(mockClient)
        expect(result).toEqual({
          gasPrice: numberToHex(expectedBufferedGasPrice),
          maxPriorityFeePerGas: "0x0",
          maxFeePerGas: "0x0",
        })
      })
    })

    describe("Ronin Gas Sponsor transactions", () => {
      beforeEach(() => {
        mockIsEIP1559CompatibleTransaction.mockReturnValue(true)
      })

      test("should handle RoninGasSponsor transaction type", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: mockGasSuggestion,
          error: undefined,
        })

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.RoninGasSponsor,
        }

        const result = await estimateFeesPerGas(mockClient, params)

        expect(result).toEqual({
          gasPrice: "0x0",
          maxPriorityFeePerGas: numberToHex(mockGasSuggestion.medium.max_priority_fee_per_gas),
          maxFeePerGas: numberToHex(mockGasSuggestion.medium.max_fee_per_gas),
        })
      })
    })
  })
})
