import { type Address, type Hex, type TypedDataDefinition, verifyTypedData } from "viem"

import { isHeadlessV2Prod } from "../../common"
import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { prepareTypedData } from "../../common/transaction/prepare-typed-data"
import { hexToBase64 } from "../../common/utils/convertor"
import { toEthereumSignature } from "../../common/utils/signature"
import { signMessageApi } from "../api/sign"
import { BaseParams } from "../types"

export type SignTypedDataParams = BaseParams & {
  typedData: TypedDataDefinition
  address: Address
}

export const signTypedDataAction = async (params: SignTypedDataParams): Promise<Hex> => {
  const { typedData, waypointToken, address, httpUrl } = params
  const tracker = createTracker({
    event: HeadlessEventName.signTypedDataByHeadlessV2,
    waypointToken: params.waypointToken,
    passwordlessServiceUrl: params.httpUrl,
    isProdEnv: isHeadlessV2Prod(params.httpUrl),
  })

  try {
    const signResult = await signMessageApi({
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
      throw new HeadlessClientError({
        cause: undefined,
        code: HeadlessClientErrorCode.InvalidSignatureError,
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
