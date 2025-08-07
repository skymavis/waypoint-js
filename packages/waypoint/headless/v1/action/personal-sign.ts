import { type Hex, type SignableMessage, toPrefixedMessage, verifyMessage } from "viem"

import { isProd } from "../../common"
import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { getAddressFromShard } from "./get-address"
import { _sign } from "./sign"

export type PersonalSignParams = {
  message: SignableMessage

  waypointToken: string
  clientShard: string

  wasmUrl: string
  wsUrl: string
}

export const personalSign = async (params: PersonalSignParams): Promise<Hex> => {
  const tracker = createTracker({
    event: HeadlessEventName.personalSign,
    waypointToken: params.waypointToken,
    isProdEnv: isProd(params.wsUrl),
    wasmUrl: params.wasmUrl,
  })

  try {
    const { message, ...restParams } = params
    const address = getAddressFromShard(params.clientShard)
    const prefixedMessage = toPrefixedMessage(message)

    const signature = await _sign({ ...restParams, rawMessage: prefixedMessage })
    const isValid = await verifyMessage({
      address: address,
      message,
      signature,
    })

    if (!isValid)
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.InvalidSignatureError,
        message: `Unable to verify the signature="${signature}" with the given address="${address}".`,
      })

    tracker.trackOk({
      request: { message },
    })
    return signature
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
