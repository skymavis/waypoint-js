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

import { CommunicateHelper } from "../../common/communicate"
import { openPopup } from "../../common/popup"
import { WaypointConfig } from "../common"

type PersonalSignParams = {
  config: WaypointConfig
  params: [data: Hex, address: Address]
  expectAddress?: Address

  clientId: string
  waypointOrigin: string
  communicateHelper: CommunicateHelper
}

export const personalSign = async ({
  config,
  params,
  expectAddress,

  clientId,
  waypointOrigin,
  communicateHelper,
}: PersonalSignParams) => {
  const [data, address] = params

  if (address && expectAddress && !isAddressEqual(address, expectAddress)) {
    const err = new Error("personal_sign: current address is different from required address")
    throw new UnauthorizedProviderError(err)
  }

  // * Ronin Waypoint only accept raw string message - NOT hex
  const message = !isHex(data) ? data : hexToString(data)

  if (!message) {
    const err = new Error("personal_sign: message is NOT define")
    throw new InvalidParamsRpcError(err)
  }

  const signature = await communicateHelper.sendRequest<string>(state =>
    openPopup(`${waypointOrigin}/wallet/sign`, {
      state,
      clientId,
      origin: window.location.origin,

      expectAddress,
      message,
      ...config,
    }),
  )

  if (!isHex(signature)) {
    const err = new Error("personal_sign: signature is not valid")
    throw new InternalRpcError(err)
  }

  return signature
}
