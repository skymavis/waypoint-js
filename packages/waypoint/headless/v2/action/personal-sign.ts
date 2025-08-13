import {
  type Address,
  type Hex,
  type SignableMessage,
  toPrefixedMessage,
  verifyMessage,
} from "viem"

import { isHeadlessV2Prod } from "../../common"
import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { hexToBase64 } from "../../common/utils/convertor"
import { toEthereumSignature } from "../../common/utils/signature"
import { signMessageApi } from "../api/sign"
import { BaseParams } from "../types"

export type PersonalSignParams = BaseParams & {
  message: SignableMessage
  address: Address
}

export const personalSignAction = async (params: PersonalSignParams): Promise<Hex> => {
  const tracker = createTracker({
    event: HeadlessEventName.personalSignByHeadlessV2,
    waypointToken: params.waypointToken,
    passwordlessServiceUrl: params.httpUrl,
    isProdEnv: isHeadlessV2Prod(params.httpUrl),
  })
  try {
    const { message, waypointToken, address, httpUrl } = params

    const signResult = await signMessageApi({
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
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.InvalidSignatureError,
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
