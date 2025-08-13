import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { authenticateApi } from "../api/authenticate"
import { AESEncrypt } from "../helper/crypto-actions"
import { BaseParams } from "../types"

export type AuthenticateActionParams = BaseParams & {
  password: string
  exchangePublicKey: string
}

export const authenticateAction = async (params: AuthenticateActionParams) => {
  const { httpUrl, waypointToken, password, exchangePublicKey } = params

  const tracker = createTracker({
    event: HeadlessEventName.authenticateByHeadlessV2,
    waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isHeadlessV2Prod(httpUrl),
  })

  try {
    const encryptedPassword = await AESEncrypt({
      content: password,
      key: exchangePublicKey,
    })

    const data = await authenticateApi({
      httpUrl,
      waypointToken,
      ciphertextB64: encryptedPassword.ciphertextB64,
      clientEncryptedKeyB64: encryptedPassword.encryptedKeyB64,
      nonceB64: encryptedPassword.nonceB64,
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
