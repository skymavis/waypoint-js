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

import { CommunicateHelper } from "../../common/communicate"
import { openPopup } from "../../common/popup"

type SignTypedDataV4Params = {
  params: [address: Address, data: TypedDataDefinition | string]
  expectAddress: Address

  clientId: string
  chainId: number
  waypointOrigin: string
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
    const err = new Error(
      `eth_signTypedData_v4: invalid typed data - required ${REQUIRED_PROPERTIES.join(", ")}`,
    )
    throw new InvalidParamsRpcError(err)
  }

  const rawChainId = typedData.domain?.chainId
  if (rawChainId === undefined) {
    const chainIdError = new Error(
      `eth_signTypedData_v4: chainId is NOT defined - expected ${chainId}`,
    )
    throw new InvalidParamsRpcError(chainIdError)
  }

  const requestChainId = isHex(rawChainId) ? hexToNumber(rawChainId) : +rawChainId
  if (chainId !== requestChainId) {
    const chainIdError = new Error(
      `eth_signTypedData_v4: chainId is NOT valid - expected ${chainId}`,
    )
    throw new InvalidParamsRpcError(chainIdError)
  }

  return typedData
}

export const signTypedDataV4 = async ({
  params,
  expectAddress,

  clientId,
  chainId,
  waypointOrigin,
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
    const signature = await communicateHelper.sendRequest<string>(state =>
      openPopup(`${waypointOrigin}/wallet/sign`, {
        state,

        clientId,
        origin: window.location.origin,

        chainId,
        expectAddress,

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
