import { isPasswordlessProd } from "../../common"
import { ServerError } from "../../common/error/server"
import { request } from "../../common/request/request"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { RawServerError } from "../error/raw-server"
import { BaseParams } from "./types"

export type GenerateExchangeKeyParams = BaseParams

export type GenerateExchangeKeyApiResponse = {
  uuid: string
}

export async function generateKeyPasswordless(params: GenerateExchangeKeyParams) {
  const { httpUrl, waypointToken } = params

  const tracker = createTracker({
    event: HeadlessEventName.genPasswordlessKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isPasswordlessProd(httpUrl),
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

  const tracker = createTracker({
    event: HeadlessEventName.genExchangeAsymmetricKey,
    waypointToken: waypointToken,
    passwordlessServiceUrl: httpUrl,
    isProdEnv: isPasswordlessProd(httpUrl),
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
