import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"
import { BaseParams, EncryptedPasswordParams } from "./types"

export type SetPasswordParams = BaseParams & EncryptedPasswordParams

export type SetPasswordApiResponse = {
  uuid: string
}

export const setPasswordApi = async (params: SetPasswordParams) => {
  const { httpUrl, waypointToken, ciphertextB64, clientEncryptedKeyB64, nonceB64 } = params

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
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
