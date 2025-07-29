import { type Hex, type TypedDataDefinition, verifyTypedData } from "viem"

import { prepareTypedData } from "../../headless-common-helper/transaction/prepare-typed-data"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { createTracker, HeadlessEventName } from "../track/track"
import { getAddressFromShard } from "./get-address"
import { _sign } from "./sign"

export type SignTypedDataParams = {
  typedData: TypedDataDefinition

  waypointToken: string
  clientShard: string

  wasmUrl: string
  wsUrl: string
}

export const signTypedData = async (params: SignTypedDataParams): Promise<Hex> => {
  const tracker = createTracker({
    event: HeadlessEventName.signTypedData,
    waypointToken: params.waypointToken,
    productionFactor: params.wsUrl,
    wasmUrl: params.wasmUrl,
  })

  try {
    const { typedData, ...restParams } = params
    const address = getAddressFromShard(params.clientShard)
    const rawMessage = prepareTypedData(typedData)

    const signature = await _sign({ ...restParams, rawMessage: rawMessage })
    const isValid = await verifyTypedData({
      ...typedData,
      address: address,
      signature,
    })

    if (!isValid)
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.InvalidSignatureError,
        message: `Unable to verify the signature="${signature}" with the given address="${address}".`,
      })

    tracker.trackOk({
      request: { typedData },
    })
    return signature
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
