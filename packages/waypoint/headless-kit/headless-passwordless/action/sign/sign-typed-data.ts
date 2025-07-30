import { type Address, type Hex, type TypedDataDefinition, verifyTypedData } from "viem"

import { prepareTypedData } from "../../../headless-common-helper/transaction/prepare-typed-data"
import { hexToBase64 } from "../../../headless-common-helper/utils/convertor"
import { toEthereumSignature } from "../../../headless-common-helper/utils/signature"
import {
  HeadlessPasswordlessClientError,
  HeadlessPasswordlessClientErrorCode,
} from "../../error/client"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../../track/track"
import { sign } from "../sign"

export type SignTypedDataParams = {
  typedData: TypedDataDefinition

  waypointToken: string
  address: Address

  httpUrl: string
}

export const signTypedData = async (params: SignTypedDataParams): Promise<Hex> => {
  const { typedData, waypointToken, address, httpUrl } = params
  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.signTypedData,
    waypointToken: params.waypointToken,
    passwordlessServiceUrl: params.httpUrl,
    productionFactor: params.httpUrl,
  })

  try {
    const signResult = await sign({
      messageBase64: hexToBase64(prepareTypedData(typedData)),
      waypointToken,
      httpUrl,
    })

    const signature = toEthereumSignature(signResult.signature)

    const isSignatureValid = await verifyTypedData({
      ...typedData,
      address,
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
      request: { typedData },
    })

    return signature
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
