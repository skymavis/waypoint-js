import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { RawServerError } from "../error/raw-server"
import { BaseParams } from "./types"

export type GenerateExchangeKeyParams = BaseParams

export type GenerateExchangeKeyApiResponse = {
  uuid: string
}

export async function generateKeyPasswordlessApi(params: GenerateExchangeKeyParams) {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GenerateExchangeKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/keygen`,
    {
      headers: { authorization: waypointToken },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}

export type GenerateExchangeAsymmetricKeyParams = BaseParams

export type GenerateExchangeAsymmetricKeyApiResponse = {
  public_key: string
}

export async function generateExchangeAsymmetricKeyApi(
  params: GenerateExchangeAsymmetricKeyParams,
) {
  const { httpUrl, waypointToken } = params

  const { data, error } = await request<GenerateExchangeAsymmetricKeyApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/generate-exchange-key`,
    {
      headers: { authorization: waypointToken },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}

export type GetPublicKeyParams = BaseParams

export type GetPublicKeyApiResponse = {
  public_key: string
}

export const getExchangePublicKeyApi = async (params: GetPublicKeyParams) => {
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
