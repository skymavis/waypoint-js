import {
  type Address,
  type Hex,
  type SignableMessage,
  toPrefixedMessage,
  verifyMessage,
} from "viem"

import { hexToBase64 } from "../../../common/utils/convertor"
import { toEthereumSignature } from "../../../common/utils/signature"
import {
  HeadlessPasswordlessClientError,
  HeadlessPasswordlessClientErrorCode,
} from "../../error/client"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../../track/track"
import { sign } from "../sign"

export type PersonalSignParams = {
  message: SignableMessage
  waypointToken: string
  address: Address

  httpUrl: string
}

export const personalSign = async (params: PersonalSignParams): Promise<Hex> => {
  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.personalSign,
    waypointToken: params.waypointToken,
    passwordlessServiceUrl: params.httpUrl,
    productionFactor: params.httpUrl,
  })
  try {
    const { message, waypointToken, address, httpUrl } = params

    const signResult = await sign({
      messageBase64: hexToBase64(toPrefixedMessage(message)),
      waypointToken,
      httpUrl,
    })

    const signature = toEthereumSignature(signResult.signature)

    const isSignatureValid = await verifyMessage({
      address,
      message,
      signature,
    })

    if (!isSignatureValid) {
      throw new HeadlessPasswordlessClientError({
        cause: undefined,
        code: HeadlessPasswordlessClientErrorCode.InvalidSignatureError,
        message: `Unable to verify the signature="${signature}" with the given address="${address}".`,
      })
    }

    tracker.trackOk({
      request: { message },
    })

    return signature
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
