import { request } from "../../headless-common-helper/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../track/track"
import { BaseParams } from "./types"

export type GenerateKeyPasswordlessParams = BaseParams

export type GenerateKeyPasswordlessApiResponse = {
  uuid: string
}

export async function generateKeyPasswordless(params: GenerateKeyPasswordlessParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.genPasswordlessKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    productionFactor: httpUrl,
  })

  const { data, error } = await request<GenerateKeyPasswordlessApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/keygen`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.keygen,
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

export type GenerateAsymmetricKeyParams = BaseParams

export type GenerateAsymmetricKeyResult = {
  public_key: string
}

export type GenerateAsymmetricKeyApiResponse = GenerateAsymmetricKeyResult

export async function generateAsymmetricKey(params: GenerateAsymmetricKeyParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.genAsymmetricKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    productionFactor: httpUrl,
  })
  const { data, error } = await request<GenerateAsymmetricKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/generate-asymmetric-key`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.generateAsymmetricKey,
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

export type GetPublicKeyParams = BaseParams

export type GetPublicKeyResult = {
  public_key: string
}

export type GetPublicKeyApiResponse = GetPublicKeyResult

export const getPublicKey = async (params: GetPublicKeyParams) => {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GetPublicKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/get-public-key`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.getPublicKey,
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
