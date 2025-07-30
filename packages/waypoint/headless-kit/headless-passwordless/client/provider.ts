import { EventEmitter } from "events"
import type { Address, EIP1193Parameters, Hex, TypedDataDefinition } from "viem"
import { InternalRpcError, isAddressEqual, toHex, UnauthorizedProviderError } from "viem"

import {
  HeadlessProviderBaseSchema,
  HeadlessProviderBaseType,
} from "../../headless-common-helper/provider/types"
import { TransactionParams } from "../../headless-common-helper/transaction/common"
import {
  HeadlessPasswordlessClientError,
  HeadlessPasswordlessClientErrorCode,
} from "../error/client"
import { HeadlessPasswordlessCore } from "./core"

export type HeadlessPasswordlessProviderSchema = HeadlessProviderBaseSchema
export type HeadlessPasswordlessProviderType = HeadlessProviderBaseType

// ! Keep the same interface with internal libs
export class HeadlessPasswordlessProvider
  extends EventEmitter
  implements HeadlessPasswordlessProviderType
{
  private core: HeadlessPasswordlessCore

  protected constructor(core: HeadlessPasswordlessCore) {
    super()

    this.core = core
  }

  static fromHeadlessCore = (core: HeadlessPasswordlessCore) => {
    return new HeadlessPasswordlessProvider(core)
  }

  getAccounts = async () => {
    try {
      const address = await this.core.getAddress()

      if (address) {
        return [address] as const
      }
    } catch (error) {
      /* empty */
    }

    return []
  }

  requestAccounts = async () => {
    try {
      const address = await this.core.getAddress()

      if (address) {
        return [address] as const
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedProviderError(err)
      }
    }

    throw new UnauthorizedProviderError(
      new Error("The headless passwordless core is not signable."),
    )
  }

  personalSign = async (params: [data: Hex, address: Address]) => {
    const [data, address] = params
    const [currentAddress] = await this.requestAccounts()

    if (!isAddressEqual(address, currentAddress)) {
      const notMatchError = new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.AddressIsNotMatch,
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

      const unknownErr = new HeadlessPasswordlessClientError({
        cause: err,
        code: HeadlessPasswordlessClientErrorCode.UnknownError,
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
      const parseError = new HeadlessPasswordlessClientError({
        cause: err,
        code: HeadlessPasswordlessClientErrorCode.ParseTypedDataError,
        message: `Unable to parse typedData="${data}".`,
      })
      throw new InternalRpcError(parseError)
    }

    const [currentAddress] = await this.requestAccounts()
    if (!isAddressEqual(address, currentAddress)) {
      const notMatchError = new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.AddressIsNotMatch,
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

      const unknownErr = new HeadlessPasswordlessClientError({
        cause: err,
        code: HeadlessPasswordlessClientErrorCode.UnknownError,
        message: "Unable to sign typed data.",
      })
      throw new InternalRpcError(unknownErr)
    }
  }

  request = async <ReturnType = unknown>(
    args: EIP1193Parameters<HeadlessPasswordlessProviderSchema>,
  ) => {
    const { params, method } = args

    switch (method) {
      case "eth_accounts": {
        const result = this.getAccounts()
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

          const unknownErr = new HeadlessPasswordlessClientError({
            cause: err,
            code: HeadlessPasswordlessClientErrorCode.UnknownError,
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
