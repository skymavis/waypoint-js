import { type Hex, type TypedDataDefinition, verifyTypedData } from "viem"

import { isHeadlessV1Prod } from "../../common"
import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { parseTypedData, prepareTypedData } from "../../common/transaction/prepare-typed-data"
import { getAddressFromShard } from "./get-address"
import { _sign } from "./sign"

export type SignTypedDataParams = {
  data: TypedDataDefinition | string

  waypointToken: string
  clientShard: string

  wasmUrl: string
  wsUrl: string
}

export const signTypedData = async (params: SignTypedDataParams): Promise<Hex> => {
  const tracker = createTracker({
    event: HeadlessEventName.signTypedData,
    waypointToken: params.waypointToken,
    isProdEnv: isHeadlessV1Prod(params.wsUrl),
    wasmUrl: params.wasmUrl,
  })

  try {
    const { data, ...restParams } = params
    const typedData = parseTypedData(data)
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
