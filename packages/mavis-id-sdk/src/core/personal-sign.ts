import {
  type Address,
  type Hex,
  hexToString,
  InternalRpcError,
  InvalidParamsRpcError,
  isAddressEqual,
  isHex,
  UnauthorizedProviderError,
} from "viem"

import { openPopup } from "../utils/popup"
import { CommunicateHelper } from "./communicate"

type PersonalSignParams = {
  params: [data: Hex, address: Address]
  expectAddress: Address

  clientId: string
  gateOrigin: string
  communicateHelper: CommunicateHelper
}

export const personalSign = async ({
  params,
  expectAddress,

  clientId,
  gateOrigin,
  communicateHelper,
}: PersonalSignParams) => {
  const [data, address] = params

  if (!isAddressEqual(address, expectAddress)) {
    const err = new Error("personal_sign: current address is different from required address")
    throw new UnauthorizedProviderError(err)
  }

  // * ID only accept raw string message - NOT hex
  const message = !isHex(data) ? data : hexToString(data)

  if (!message) {
    const err = new Error("personal_sign: message is NOT define")
    throw new InvalidParamsRpcError(err)
  }

  const signature = await communicateHelper.sendRequest<string>(requestId =>
    openPopup(`${gateOrigin}/wallet/sign`, {
      clientId,
      state: requestId,
      origin: window.location.origin,
      message,
      expectAddress,
    }),
  )

  if (!isHex(signature)) {
    const err = new Error("personal_sign: signature is not valid")
    throw new InternalRpcError(err)
  }

  return signature
}
