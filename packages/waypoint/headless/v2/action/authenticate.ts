import { isPasswordlessProd, ServerError } from "../../common"
import { request } from "../../common/request/request"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { RawServerError } from "../error/raw-server"
import { BaseParams, EncryptedPasswordParams } from "./types"

export type AuthenticateParams = BaseParams & EncryptedPasswordParams

export type AuthenticateApiResponse = {
  uuid: string
  verified_at: number
  expired_at: number
}

export const authenticate = async (params: AuthenticateParams) => {
  const { httpUrl, waypointToken, ciphertextB64, clientEncryptedKeyB64, nonceB64 } = params

  const tracker = createTracker({
    event: HeadlessEventName.authenticate,
    waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isPasswordlessProd(httpUrl),
  })

  const { data, error } = await request<AuthenticateApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/auth-session`,
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
