import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { generateExchangeAsymmetricKeyApi, generateKeyPasswordlessApi } from "../api/key"
import { BaseParams } from "../types"

export async function generateKeyPasswordlessAction(params: BaseParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createTracker({
    event: HeadlessEventName.genKeyByHeadlessV2,
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

export async function generateExchangeAsymmetricKeyAction(params: BaseParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createTracker({
    event: HeadlessEventName.genExchangeAsymmetricKeyByHeadlessV2,
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
