import { type Address, Client, createPublicClient, type Hex, http, numberToHex } from "viem"
import { estimateGas, getTransactionCount } from "viem/actions"
import { ronin } from "viem/chains"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../../common/error/client"
import {
  PAYER_INFO,
  SupportedTransaction,
  type TransactionParams,
  UnsupportedTransaction,
} from "../../../common/transaction/common"
import {
  estimateFeesPerGas,
  EstimateFeesPerGasReturnType,
} from "../../../common/transaction/estimate-fee-per-gas"
import {
  DEFAULT_DATA,
  DEFAULT_VALUE,
  estimateGasLimit,
  EXPIRED_TIME_PLACEHOLDER,
  type FormatTransactionParams,
  GAS_LIMIT_BUFFER_MULTIPLIER,
  getNonceFromNetwork,
  toTransactionInServerFormat,
  validateFromAddress,
  validateToAddress,
  validateTransactionType,
} from "../../../common/transaction/prepare-tx"
import { isSupportedTransaction } from "../../../common/transaction/tx-type-check"

vi.mock("viem/actions", () => ({
  estimateGas: vi.fn(),
  getTransactionCount: vi.fn(),
}))
vi.mock("../../../common/transaction/estimate-fee-per-gas", () => ({
  estimateFeesPerGas: vi.fn(),
}))
vi.mock("../../../common/transaction/tx-type-check", () => ({
  isSupportedTransaction: vi.fn(),
}))

const mockEstimateGas = vi.mocked(estimateGas)
const mockGetTransactionCount = vi.mocked(getTransactionCount)
const mockEstimateFeesPerGas = vi.mocked(estimateFeesPerGas)
const mockIsSupportedTransaction = vi.mocked(isSupportedTransaction)

describe("prepare-tx", () => {
  const mockAddress: Address = "0x1234567890123456789012345678901234567890"
  const mockToAddress: Address = "0x9876543210987654321098765432109876543210"

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("Constants", () => {
    test("should have correct default values", () => {
      expect(DEFAULT_VALUE).toBe("0x0")
      expect(DEFAULT_DATA).toBe("0x")
      expect(GAS_LIMIT_BUFFER_MULTIPLIER).toBe(2n)
      expect(EXPIRED_TIME_PLACEHOLDER).toBe("0x5208")
    })
  })

  describe("validateTransactionType", () => {
    test("should return supported transaction type when valid", () => {
      mockIsSupportedTransaction.mockReturnValue(true)

      const type = SupportedTransaction.EIP1559
      const result = validateTransactionType(type)

      expect(mockIsSupportedTransaction).toHaveBeenCalledWith(type)
      expect(result).toBe(type)
    })

    test("should throw error for unsupported transaction type", () => {
      mockIsSupportedTransaction.mockReturnValue(false)
      const type = UnsupportedTransaction.EIP2930

      expect(() => validateTransactionType(type)).toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
          message: `Transaction type "${type}" is not supported. Supported types: legacy (0x0), EIP1559 (0x2), sponsored (0x64).`,
        }),
      )
    })

    test("should throw error for undefined transaction type", () => {
      mockIsSupportedTransaction.mockReturnValue(false)

      expect(() => validateTransactionType(undefined)).toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
          message: `Transaction type "undefined" is not supported. Supported types: legacy (0x0), EIP1559 (0x2), sponsored (0x64).`,
        }),
      )
    })
  })

  describe("validateToAddress", () => {
    test("should return valid address when provided", () => {
      const result = validateToAddress(mockToAddress)
      expect(result).toBe(mockToAddress)
    })

    test("should throw error for null address", () => {
      expect(() => validateToAddress(null)).toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
          message: `Invalid 'to' address: null.`,
        }),
      )
    })

    test("should throw error for invalid address format", () => {
      const invalidAddress = "0xinvalid" as Address

      expect(() => validateToAddress(invalidAddress)).toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
          message: `Invalid 'to' address: ${invalidAddress}.`,
        }),
      )
    })
  })

  describe("validateFromAddress", () => {
    test("should return valid address when provided", () => {
      const result = validateFromAddress(mockAddress)
      expect(result).toBe(mockAddress)
    })

    test("should throw error for undefined address", () => {
      expect(() => validateFromAddress(undefined)).toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.PrepareTransactionError,
          message: `Invalid 'from' address: undefined.`,
        }),
      )
    })

    test("should throw error for invalid address format", () => {
      const invalidAddress = "0xinvalid" as Address

      expect(() => validateFromAddress(invalidAddress)).toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.PrepareTransactionError,
          message: `Invalid 'from' address: ${invalidAddress}.`,
        }),
      )
    })
  })

  describe("estimateGasLimit", () => {
    let mockClient: Client

    beforeEach(() => {
      mockClient = createPublicClient({
        chain: ronin,
        transport: http(),
      })
    })

    test("should return provided gas when available", async () => {
      const providedGas = "0x5208"

      const result = await estimateGasLimit(mockClient, {
        to: mockToAddress,
        from: mockAddress,
        value: DEFAULT_VALUE,
        data: DEFAULT_DATA,
        gas: providedGas,
      })

      expect(result).toBe(providedGas)
      expect(mockEstimateGas).not.toHaveBeenCalled()
    })

    test("should estimate and buffer gas when not provided", async () => {
      const baseGasLimit = 21000n
      const expectedBufferedGas = baseGasLimit * GAS_LIMIT_BUFFER_MULTIPLIER
      mockEstimateGas.mockResolvedValue(baseGasLimit)

      const result = await estimateGasLimit(mockClient, {
        to: mockToAddress,
        from: mockAddress,
        value: DEFAULT_VALUE,
        data: DEFAULT_DATA,
      })

      expect(result).toBe(numberToHex(expectedBufferedGas))
    })

    test("should handle estimate gas errors", async () => {
      const gasError = new Error("Gas estimation failed")
      mockEstimateGas.mockRejectedValue(gasError)

      await expect(
        estimateGasLimit(mockClient, {
          to: mockToAddress,
          from: mockAddress,
          value: DEFAULT_VALUE,
          data: DEFAULT_DATA,
        }),
      ).rejects.toThrow(
        new HeadlessClientError({
          cause: gasError,
          code: HeadlessClientErrorCode.PrepareTransactionError,
          message:
            "Failed to estimate gas limit. This could be due to network issues or invalid transaction parameters.",
        }),
      )
    })
  })

  describe("getNonceFromNetwork", () => {
    let mockClient: Client

    beforeEach(() => {
      mockClient = createPublicClient({
        chain: ronin,
        transport: http(),
      })
    })

    test("should return provided nonce when available", async () => {
      const providedNonce: Hex = "0x10"

      const result = await getNonceFromNetwork(mockClient, {
        from: mockAddress,
        nonce: providedNonce,
      })

      expect(result).toBe(providedNonce)
      expect(mockGetTransactionCount).not.toHaveBeenCalled()
    })

    test("should fetch nonce from network when not provided", async () => {
      const networkNonce = 42
      mockGetTransactionCount.mockResolvedValue(networkNonce)

      const result = await getNonceFromNetwork(mockClient, {
        from: mockAddress,
      })

      expect(mockGetTransactionCount).toHaveBeenCalledWith(mockClient, {
        address: mockAddress,
        blockTag: "pending",
      })
      expect(result).toBe(numberToHex(networkNonce))
    })
  })

  describe("toTransactionInServerFormat", () => {
    const mockChainParams = {
      chainId: ronin.id,
      rpcUrl: "https://api.roninchain.com/rpc",
    }

    const mockTransaction: TransactionParams = {
      to: mockToAddress,
      type: SupportedTransaction.EIP1559,
      value: "0x100",
      data: "0xabcd",
    }

    const mockFeesPerGas: EstimateFeesPerGasReturnType = {
      gasPrice: "0x1000",
      maxFeePerGas: "0x2000",
      maxPriorityFeePerGas: "0x500",
    }

    beforeEach(() => {
      mockIsSupportedTransaction.mockReturnValue(true)
      mockGetTransactionCount.mockResolvedValue(5)
      mockEstimateFeesPerGas.mockResolvedValue(mockFeesPerGas)
      mockEstimateGas.mockResolvedValue(21000n)
    })

    test("should format complete transaction with all parameters", async () => {
      const params: FormatTransactionParams = {
        transaction: mockTransaction,
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      const result = await toTransactionInServerFormat(params)

      expect(result).toEqual({
        type: mockTransaction.type,
        from: mockAddress,
        to: mockToAddress,
        value: mockTransaction.value,
        input: mockTransaction.data,
        gasPrice: "0x1000",
        gas: numberToHex(21000n * GAS_LIMIT_BUFFER_MULTIPLIER),
        nonce: "0x5",
        chainId: numberToHex(ronin.id),
        maxFeePerGas: "0x2000",
        maxPriorityFeePerGas: "0x500",
        r: DEFAULT_VALUE,
        v: DEFAULT_VALUE,
        s: DEFAULT_VALUE,
        payerS: PAYER_INFO.s,
        payerR: PAYER_INFO.r,
        payerV: PAYER_INFO.v,
        expiredTime: EXPIRED_TIME_PLACEHOLDER,
      })
    })

    test("should use input field over data field when both provided", async () => {
      const params: FormatTransactionParams = {
        transaction: {
          ...mockTransaction,
          input: "0x1234",
          data: "0x5678",
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      const result = await toTransactionInServerFormat(params)

      expect(result.input).toBe("0x1234")
    })

    test("should use default values when optional parameters not provided", async () => {
      const params: FormatTransactionParams = {
        transaction: {
          to: mockToAddress,
          type: SupportedTransaction.Legacy,
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      const result = await toTransactionInServerFormat(params)

      expect(result.value).toBe(DEFAULT_VALUE)
      expect(result.input).toBe(DEFAULT_DATA)
    })

    test("should use provided from address over currentAddress", async () => {
      const explicitFromAddress: Address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
      const params: FormatTransactionParams = {
        transaction: {
          ...mockTransaction,
          from: explicitFromAddress,
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      const result = await toTransactionInServerFormat(params)

      expect(result.from).toBe(explicitFromAddress)
    })

    test("should handle provided gas price", async () => {
      const params: FormatTransactionParams = {
        transaction: {
          ...mockTransaction,
          gasPrice: "0x3000",
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      await toTransactionInServerFormat(params)

      expect(mockEstimateFeesPerGas).toHaveBeenCalledWith(expect.any(Object), {
        type: SupportedTransaction.EIP1559,
        chainId: ronin.id,
        gasPrice: "0x3000",
      })
    })

    test("should handle provided nonce and gas", async () => {
      const params: FormatTransactionParams = {
        transaction: {
          ...mockTransaction,
          nonce: "0xa",
          gas: "0x7530",
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      const result = await toTransactionInServerFormat(params)

      expect(result.nonce).toBe("0xa")
      expect(result.gas).toBe("0x7530")
      expect(mockGetTransactionCount).not.toHaveBeenCalled()
    })

    test("should throw error for unsupported transaction type", async () => {
      mockIsSupportedTransaction.mockReturnValue(false)

      const params: FormatTransactionParams = {
        transaction: {
          ...mockTransaction,
          type: UnsupportedTransaction.EIP2930,
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      await expect(toTransactionInServerFormat(params)).rejects.toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
          message: `Transaction type "${UnsupportedTransaction.EIP2930}" is not supported. Supported types: legacy (0x0), EIP1559 (0x2), sponsored (0x64).`,
        }),
      )
    })

    test("should throw error for invalid to address", async () => {
      const params: FormatTransactionParams = {
        transaction: {
          ...mockTransaction,
          to: null,
        },
        chain: mockChainParams,
        currentAddress: mockAddress,
      }

      await expect(toTransactionInServerFormat(params)).rejects.toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedTransactionTypeError,
          message: "Invalid 'to' address: null.",
        }),
      )
    })

    test("should throw error when currentAddress not provided and no from address", async () => {
      const params: FormatTransactionParams = {
        transaction: mockTransaction,
        chain: mockChainParams,
      }

      await expect(toTransactionInServerFormat(params)).rejects.toThrow(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.PrepareTransactionError,
          message: "Invalid 'from' address: undefined.",
        }),
      )
    })
  })
})
