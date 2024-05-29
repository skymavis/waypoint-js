import {
  type Address,
  hexToNumber,
  InternalRpcError,
  InvalidParamsRpcError,
  isAddressEqual,
  isHex,
  type TypedDataDefinition,
  UnauthorizedProviderError,
} from "viem"

import { openPopup } from "../utils/popup"
import { CommunicateHelper } from "./communicate"

export type SignTypedDataV4Params = {
  params: [address: Address, data: TypedDataDefinition | string]
  expectAddress: Address

  clientId: string
  chainId: number
  gateOrigin: string
  communicateHelper: CommunicateHelper
}

const REQUIRED_PROPERTIES = ["types", "domain", "primaryType", "message"]

const isValidTypedData = (typedData: TypedDataDefinition) =>
  REQUIRED_PROPERTIES.every(k => k in typedData)

const transformTypedData = (
  data: TypedDataDefinition | string,
  chainId: number,
): TypedDataDefinition => {
  let typedData: TypedDataDefinition

  try {
    if (typeof data === "string") {
      typedData = JSON.parse(data) as TypedDataDefinition
    } else {
      typedData = data
    }
  } catch (_err) {
    const parseError = new Error("eth_signTypedData_v4: could NOT parse typed data")
    throw new InvalidParamsRpcError(parseError)
  }

  if (!isValidTypedData(typedData)) {
    const typeError = new Error("eth_signTypedData_v4: invalid typed data")
    throw new InvalidParamsRpcError(typeError)
  }

  const rawChainId = typedData.domain?.chainId
  const requestChainId = isHex(rawChainId) ? hexToNumber(rawChainId) : +(rawChainId ?? chainId)

  if (chainId !== requestChainId) {
    const chainIdError = new Error(
      `eth_signTypedData_v4: chainId is NOT valid - expected ${chainId}`,
    )
    throw new InvalidParamsRpcError(chainIdError)
  }

  if (typedData.domain) {
    typedData.domain.chainId = requestChainId
  }

  return typedData
}

export const signTypedDataV4 = async ({
  params,
  expectAddress,

  clientId,
  chainId,
  gateOrigin,
  communicateHelper,
}: SignTypedDataV4Params) => {
  const [address, data] = params

  if (!data) throw new InvalidParamsRpcError(new Error("eth_signTypedData_v4: data is NOT define"))

  if (!isAddressEqual(address, expectAddress)) {
    throw new UnauthorizedProviderError(
      new Error("eth_signTypedData_v4: current address is different from required address"),
    )
  }

  const typedData = transformTypedData(data, chainId)

  try {
    const signature = await communicateHelper.sendRequest<string>(requestId =>
      openPopup(`${gateOrigin}/wallet/sign`, {
        clientId,

        chainId,
        expectAddress,

        state: requestId,
        origin: window.location.origin,
        typedData: JSON.stringify(typedData),
      }),
    )

    if (!isHex(signature)) {
      throw new Error("eth_signTypedData_v4: signature is not valid")
    }

    return signature
  } catch (err) {
    if (err instanceof Error) {
      throw new InternalRpcError(err)
    }

    const unknownErr = new Error("eth_signTypedData_v4: unknown error")
    throw new InternalRpcError(unknownErr)
  }
}
