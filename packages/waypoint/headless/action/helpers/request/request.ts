import { addBearerPrefix } from "../../../utils/token"
import { requestController } from "./abort-controller"
import { allowedMethods, requestTimeoutInMs } from "./configurations"
import type { RequestMethod, RequestOption, RequestRoute, ResponseType } from "./types"

const DEFAULT_CONTENT_TYPE = "application/json"

export const request = async <R = unknown, E = unknown>(
  route: RequestRoute,
  option: RequestOption = {},
): Promise<ResponseType<R, E>> => {
  const [method, endpoint] = route.split(" ", 2) as [RequestMethod, string]

  // ? Request `method` validation
  if (!allowedMethods.includes(method)) {
    throw new Error("Request method not allowed")
  }

  const { headers = {}, body, key: requestKey, ...restOpts } = option

  // ? Request `header` initialization & validation
  const requestHeaders = new Headers({ Accept: "application/json" })
  const { contentType = DEFAULT_CONTENT_TYPE, authorization, authorizationPayer } = headers

  // ? Request `Authorization` setting
  if (authorization) {
    requestHeaders.set("Authorization", addBearerPrefix(authorization))
  }

  // ? Set payer access token. Specific for Mpc payer
  if (authorizationPayer) {
    requestHeaders.set("Authorization", addBearerPrefix(authorizationPayer))
  }

  // ? Request `Content-Type` setting
  requestHeaders.set("Content-Type", contentType)

  const requestBody = body ? JSON.stringify(body) : undefined

  // ? Abort controller initialization
  const abortController = new AbortController()
  if (requestKey) {
    requestController[requestKey] = abortController
  }

  // ? Request Init
  const requestInit: RequestInit = {
    ...restOpts,
    method: method.toUpperCase(),
    headers: requestHeaders,
    body: requestBody,
  }

  // ? Request timeout handler
  const timeoutId = setTimeout(() => {
    abortController.abort()
    if (requestKey) {
      requestController[requestKey] = undefined
    }
  }, requestTimeoutInMs)

  // ? Execute
  const response = await fetch(endpoint, requestInit)

  // ? Cleanup
  clearTimeout(timeoutId)
  if (requestKey) {
    requestController[requestKey] = undefined
  }

  // ? Response `header` validation
  const resContentType = response.headers.get("content-type")
  if (!resContentType || !resContentType.includes("application/json")) {
    throw new TypeError("Response content-type is unhandled")
  }

  const jsonResponse = await response.json()

  // ? Response `body` validation & format
  if (response.status >= 200 && response.status <= 299) {
    return {
      status: response.status,
      error: undefined,
      data: jsonResponse,
    }
  }

  return { status: response.status, error: jsonResponse, data: undefined }
}
