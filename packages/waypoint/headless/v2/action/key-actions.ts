import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { generateExchangeAsymmetricKeyApi, generateKeyPasswordlessApi } from "../api/key"
import { BaseParams } from "../api/types"

export type GenerateExchangeKeyActionParams = BaseParams

export async function generateKeyPasswordlessAction(params: GenerateExchangeKeyActionParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createTracker({
    event: HeadlessEventName.genPasswordlessKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isHeadlessV2Prod(httpUrl),
  })

  try {
    const data = await generateKeyPasswordlessApi({
      httpUrl,
      waypointToken,
    })

    tracker.trackOk({
      response: { ...data },
    })

    return data
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}

export type GenerateExchangeAsymmetricKeyActionParams = BaseParams

export async function generateExchangeAsymmetricKeyAction(
  params: GenerateExchangeAsymmetricKeyActionParams,
) {
  const { httpUrl, waypointToken } = params

  const tracker = createTracker({
    event: HeadlessEventName.genExchangeAsymmetricKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isHeadlessV2Prod(httpUrl),
  })
  try {
    const data = await generateExchangeAsymmetricKeyApi({
      httpUrl,
      waypointToken,
    })

    tracker.trackOk({})

    return data
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
