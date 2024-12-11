import { EventEmitter } from "events"
import type {
  Address,
  EIP1193Events,
  EIP1193Parameters,
  Hash,
  Hex,
  PublicRpcSchema,
  TypedDataDefinition,
} from "viem"
import { InternalRpcError, isAddressEqual, toHex, UnauthorizedProviderError } from "viem"

import type { TransactionParams } from "../action/send-transaction/common"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { HeadlessCore } from "./core"

export type HeadlessProviderType = EIP1193Events & {
  request: <ReturnType = unknown>(
    args: EIP1193Parameters<HeadlessProviderSchema>,
  ) => Promise<ReturnType>
}

export type HeadlessProviderSchema = [
  ...PublicRpcSchema,

  {
    Method: "eth_accounts"
    Parameters?: undefined
    ReturnType: Address[]
  },
  {
    Method: "eth_requestAccounts"
    Parameters?: undefined
    ReturnType: Address[]
  },
  {
    Method: "eth_sendTransaction"
    Parameters: [transaction: TransactionParams]
    ReturnType: Hash
  },
  {
    Method: "eth_signTypedData_v4"
    Parameters: [address: Address, typedData: TypedDataDefinition | string]
    ReturnType: Hex
  },
  {
    Method: "personal_sign"
    Parameters: [data: Hex, address: Address]
    ReturnType: Hex
  },
]

// ! Keep the same interface with internal libs
export class HeadlessProvider extends EventEmitter implements HeadlessProviderType {
  private core: HeadlessCore

  protected constructor(core: HeadlessCore) {
    super()

    this.core = core
  }

  static fromHeadlessCore = (core: HeadlessCore) => {
    return new HeadlessProvider(core)
  }

  getAccounts = async () => {
    try {
      const address = await this.core.getAddress()

      return [address]
    } catch (error) {
      return []
    }
  }

  requestAccounts = async () => {
    try {
      const address = await this.core.getAddress()
      const signable = this.core.isSignable()

      if (address && signable) {
        return [address] as const
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedProviderError(err)
      }
    }

    throw new UnauthorizedProviderError(new Error("The base client is not signable."))
  }

  personalSign = async (params: [data: Hex, address: Address]) => {
    const [data, address] = params
    const [currentAddress] = await this.requestAccounts()

    if (!isAddressEqual(address, currentAddress)) {
      const notMatchError = new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.AddressIsNotMatch,
        message: `Unable to sign message, currentAddress="${currentAddress}" is different from requestedAddress="${address}".`,
      })
      throw new UnauthorizedProviderError(notMatchError)
    }

    try {
      return await this.core.signMessage({ raw: data })
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalRpcError(err)
      }

      const unknownErr = new HeadlessClientError({
        cause: err,
        code: HeadlessClientErrorCode.UnknownError,
        message: "Unable to perform personal sign.",
      })
      throw new InternalRpcError(unknownErr)
    }
  }

  signTypedDataV4 = async (params: [address: Address, data: TypedDataDefinition | string]) => {
    const [address, data] = params

    let typedData: TypedDataDefinition
    try {
      if (typeof data === "string") {
        typedData = JSON.parse(data) as TypedDataDefinition
      } else {
        typedData = data
      }
    } catch (err) {
      const parseError = new HeadlessClientError({
        cause: err,
        code: HeadlessClientErrorCode.ParseTypedDataError,
        message: `Unable to parse typedData="${data}".`,
      })
      throw new InternalRpcError(parseError)
    }

    const [currentAddress] = await this.requestAccounts()
    if (!isAddressEqual(address, currentAddress)) {
      const notMatchError = new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.AddressIsNotMatch,
        message: `Unable to sign typed data, currentAddress="${currentAddress}" is different from requestedAddress="${address}".`,
      })
      throw new UnauthorizedProviderError(notMatchError)
    }

    try {
      return await this.core.signTypedData(typedData)
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalRpcError(err)
      }

      const unknownErr = new HeadlessClientError({
        cause: err,
        code: HeadlessClientErrorCode.UnknownError,
        message: "Unable to sign typed data.",
      })
      throw new InternalRpcError(unknownErr)
    }
  }

  request = async <ReturnType = unknown>(args: EIP1193Parameters<HeadlessProviderSchema>) => {
    const { params, method } = args

    switch (method) {
      case "eth_accounts": {
        const result = await this.getAccounts()
        return result as ReturnType
      }

      case "eth_requestAccounts": {
        const result = await this.requestAccounts()

        return result as ReturnType
      }

      case "eth_chainId": {
        return toHex(this.core.chainId) as ReturnType
      }

      case "personal_sign": {
        return this.personalSign(params) as ReturnType
      }

      case "eth_signTypedData_v4": {
        return this.signTypedDataV4(params) as ReturnType
      }

      case "eth_sendTransaction": {
        try {
          const [tx] = params as [transaction: TransactionParams]

          const transaction = await this.core.sendTransaction(tx)
          return transaction.txHash as ReturnType
        } catch (err) {
          if (err instanceof Error) {
            throw new InternalRpcError(err)
          }

          const unknownErr = new HeadlessClientError({
            cause: err,
            code: HeadlessClientErrorCode.UnknownError,
            message: "Unable to send transaction.",
          })
          throw new InternalRpcError(unknownErr)
        }
      }

      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.core.publicClient.request(args as any) as ReturnType
    }
  }
}
