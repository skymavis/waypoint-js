import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../track/track"
import { BaseParams } from "./types"

export type GenerateExchangeKeyParams = BaseParams

export type GenerateExchangeKeyApiResponse = {
  uuid: string
}

export async function generateKeyPasswordless(params: GenerateExchangeKeyParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.genPasswordlessKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    productionFactor: httpUrl,
  })

  const { data, error } = await request<GenerateExchangeKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/keygen`,
    {
      headers: { authorization: waypointToken },
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

export type GenerateExchangeAsymmetricKeyParams = BaseParams

export type GenerateExchangeAsymmetricKeyResult = {
  public_key: string
}

export type GenerateExchangeAsymmetricKeyApiResponse = GenerateExchangeAsymmetricKeyResult

export async function generateExchangeAsymmetricKey(params: GenerateExchangeAsymmetricKeyParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.genExchangeAsymmetricKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    productionFactor: httpUrl,
  })
  const { data, error } = await request<GenerateExchangeAsymmetricKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/generate-exchange-key`,
    {
      headers: { authorization: waypointToken },
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

export const getExchangePublicKey = async (params: GetPublicKeyParams) => {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GetPublicKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/get-exchange-public-key`,
    {
      headers: { authorization: waypointToken },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
