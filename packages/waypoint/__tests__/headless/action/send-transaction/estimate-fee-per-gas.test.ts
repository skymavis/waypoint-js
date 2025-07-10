import { Client, createPublicClient, http, numberToHex } from "viem"
import { getGasPrice } from "viem/actions"
import { ronin, saigon } from "viem/chains"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

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
import { HeadlessClientError, HeadlessClientErrorCode } from "../../../../headless/error/client"

vi.mock("viem/actions", () => ({
  getGasPrice: vi.fn(),
}))
vi.mock("../../../../headless/action/helpers/request/request", () => ({
  request: vi.fn(),
}))
vi.mock("../../../../headless/action/helpers/tx-type-check", () => ({
  isEIP1559CompatibleTransaction: vi.fn().mockReturnValue(false),
}))

const mockGetGasPrice = vi.mocked(getGasPrice)
const mockRequest = vi.mocked(request)
const mockIsEIP1559CompatibleTransaction = vi.mocked(isEIP1559CompatibleTransaction)

describe("estimate-fee-per-gas", () => {
  let mockClient: Client

  beforeEach(() => {
    mockClient = createPublicClient({
      chain: ronin,
      transport: http(),
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
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

      test("should throw error for unsupported chain", async () => {
        const params: EstimateFeesPerGasParams = {
          chainId: 1,
          type: SupportedTransaction.EIP1559,
        }

        await expect(estimateFeesPerGas(mockClient, params)).rejects.toThrow(
          new HeadlessClientError({
            cause: expect.any(Error),
            code: HeadlessClientErrorCode.PrepareTransactionError,
            message:
              "Failed to estimate gas price. This could be due to network issues or RPC problems.",
          }),
        )
      })

      test("should throw error when gas suggestion response is empty", async () => {
        mockRequest.mockResolvedValue({
          status: 200,
          data: undefined,
          error: undefined,
        })

        const params: EstimateFeesPerGasParams = {
          chainId: ronin.id,
          type: SupportedTransaction.EIP1559,
        }

        await expect(estimateFeesPerGas(mockClient, params)).rejects.toThrow(
          new HeadlessClientError({
            cause: expect.any(Error),
            code: HeadlessClientErrorCode.PrepareTransactionError,
            message:
              "Failed to estimate gas price. This could be due to network issues or RPC problems.",
          }),
        )
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
