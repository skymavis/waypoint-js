import { isPasswordlessProd, ServerError } from "../../common"
import { request } from "../../common/request/request"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { RawServerError } from "../error/raw-server"
import { BaseParams, EncryptedPasswordParams } from "./types"

export type SetPasswordParams = BaseParams & EncryptedPasswordParams

export type SetPasswordApiResponse = {
  uuid: string
}

export const setPassword = async (params: SetPasswordParams) => {
  const { httpUrl, waypointToken, ciphertextB64, clientEncryptedKeyB64, nonceB64 } = params

  const tracker = createTracker({
    event: HeadlessEventName.setPassword,
    waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isPasswordlessProd(httpUrl),
  })

  const { data, error } = await request<SetPasswordApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/set-password`,
    {
      headers: { authorization: waypointToken },
      body: {
        ciphertext_b64: ciphertextB64,
        client_encrypted_key_b64: clientEncryptedKeyB64,
        nonce_b64: nonceB64,
      },
    },
  )

  if (data) {
    tracker.trackOk({
      response: { ...data },
    })
    return data
  }

  tracker.trackError(error)
  throw new ServerError({ code: error.error_code, message: error.error_message })
}
