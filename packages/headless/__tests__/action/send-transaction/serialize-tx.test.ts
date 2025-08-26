import { type Address } from "viem"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import {
  SupportedTransaction,
  type TransactionInServerFormat,
} from "../../../common/transaction/common"
import { serializeTX } from "../../../common/transaction/serialize-tx"
import { isEIP1559CompatibleTransaction } from "../../../common/transaction/tx-type-check"

vi.mock("../../../common/transaction/tx-type-check", () => ({
  isEIP1559CompatibleTransaction: vi.fn(),
}))

const mockIsEIP1559CompatibleTransaction = vi.mocked(isEIP1559CompatibleTransaction)

describe("serialize-tx", () => {
  const mockAddress: Address = "0x1234567890123456789012345678901234567890"
  const mockToAddress: Address = "0x9876543210987654321098765432109876543210"

  const baseTransactionData: TransactionInServerFormat = {
    from: mockAddress,
    to: mockToAddress,
    value: "0x100",
    input: "0xabcd",
    nonce: "0x5",
    gas: "0x5208",
    gasPrice: "0x1000",
    maxPriorityFeePerGas: "0x500",
    maxFeePerGas: "0x2000",
    chainId: "0x7e4",
    type: SupportedTransaction.EIP1559,
    r: "0x0",
    v: "0x0",
    s: "0x0",
    payerS: "0x3caeb99cc6659c5ca4c66b91b1686a86fe0493e1122bdd09f2babdf72e54041a",
    payerR: "0xdbdbd0989f595c0921acaf9c80342bbeff3b8ea6d2a9ad3167e63010715de3fd",
    payerV: "0x1",
    expiredTime: "0x5208",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("serializeTX", () => {
    test("should serialize EIP1559 transaction correctly", () => {
      const eip1559Transaction: TransactionInServerFormat = {
        ...baseTransactionData,
        type: SupportedTransaction.EIP1559,
      }

      mockIsEIP1559CompatibleTransaction.mockReturnValue(true)

      const result = serializeTX(eip1559Transaction)

      expect(mockIsEIP1559CompatibleTransaction).toHaveBeenCalledWith(SupportedTransaction.EIP1559)
      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
      expect(result.startsWith("0x")).toBe(true)
    })

    test("should serialize RoninGasSponsor transaction as EIP1559", () => {
      const gasSponsorTransaction: TransactionInServerFormat = {
        ...baseTransactionData,
        type: SupportedTransaction.RoninGasSponsor,
      }

      mockIsEIP1559CompatibleTransaction.mockReturnValue(true)

      const result = serializeTX(gasSponsorTransaction)

      expect(mockIsEIP1559CompatibleTransaction).toHaveBeenCalledWith(
        SupportedTransaction.RoninGasSponsor,
      )
      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
      expect(result.startsWith("0x")).toBe(true)
    })

    test("should serialize legacy transaction correctly", () => {
      const legacyTransaction: TransactionInServerFormat = {
        ...baseTransactionData,
        type: SupportedTransaction.Legacy,
      }

      mockIsEIP1559CompatibleTransaction.mockReturnValue(false)

      const result = serializeTX(legacyTransaction)

      expect(mockIsEIP1559CompatibleTransaction).toHaveBeenCalledWith(SupportedTransaction.Legacy)
      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
      expect(result.startsWith("0x")).toBe(true)
    })
  })
})
