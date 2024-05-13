import { hexToString, isHex, toHex } from "viem"

import { CommunicateHelper } from "./common/communicate-helper"
import { IEip1193RequestArgs } from "./common/eip1193"
import { JsonRpcError, RpcErrorCode } from "./common/error"
import { openPopup } from "./utils/popup"

export type PersonalSignParams = {
  params?: IEip1193RequestArgs["params"]
  clientId: string
  gateOrigin: string
  communicateHelper: CommunicateHelper
}

export const personalSign = async ({
  params,
  clientId,
  gateOrigin,
  communicateHelper,
}: PersonalSignParams): Promise<string> => {
  {
    const message: string | undefined = params?.[0]
    const fromAddress: string | undefined = params?.[1]

    if (!message || !fromAddress)
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        `personal_sign requires a message and an address`,
      )

    // const hexMessage = isHex(message) ? message : toHex(message)
    // ^ this is right for EIP1193 provider

    // FIXME: id only accept string. not hex
    const hexMessage = !isHex(message) ? message : hexToString(message)

    const signature = await communicateHelper.sendRequest<string>(requestId =>
      openPopup(`${gateOrigin}/wallet/sign`, {
        clientId,
        state: requestId,
        origin: window.location.origin,
        message: hexMessage,
      }),
    )

    return signature
  }
}
