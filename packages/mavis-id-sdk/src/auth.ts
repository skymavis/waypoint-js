import { ID_ORIGIN_PROD } from "./common/gate"
import { IdResponse } from "./common/id-response"
import { getScopesParams, Scope } from "./common/scope"
import { CommunicateHelper } from "./core/communicate"
import { openPopup, replaceUrl } from "./utils/popup"
import { validateIdAddress } from "./utils/validate-address"

export type AuthorizeOpts = {
  clientId: string
  idOrigin?: string
  scopes?: Scope[]
  redirectUrl?: string
}

export type RedirectAuthorizeOpts = AuthorizeOpts & {
  state?: string
}

/**
 * Authorizes a user via Mavis ID, returning an accessToken and user address.
 *
 * @param opts Options for authorization.
 * @returns Authorization result including accessToken and user address.
 *
 * @example
 * import { authorize } from "@sky-mavis/mavis-id-sdk"
 * const { accessToken, address } = await authorize({
 *  clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
 * })
 */
export const authorize = async (opts: AuthorizeOpts) => {
  const { clientId, idOrigin = ID_ORIGIN_PROD, scopes, redirectUrl = window.location.origin } = opts
  const helper = new CommunicateHelper(idOrigin)

  const authData = await helper.sendRequest<IdResponse>(state =>
    openPopup(`${idOrigin}/client/${clientId}/authorize`, {
      state,
      redirect: redirectUrl,
      origin: window.location.origin,
      scope: getScopesParams(scopes),
    }),
  )
  const { id_token: accessToken, address: rawAddress } = authData ?? {}

  return {
    accessToken,
    address: validateIdAddress(rawAddress),
  }
}

/**
 * Authorizes a user via Mavis ID in redirect mode, returning state, accessToken and user address.
 *
 * @param opts Options for redirect authorization.
 *
 * @example
 * import { redirectAuthorize } from "@sky-mavis/mavis-id-sdk"
 * const { state, accessToken, address } = await redirectAuthorize({
 *  clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
 * })
 */
export const redirectAuthorize = (opts: RedirectAuthorizeOpts) => {
  const {
    clientId,
    redirectUrl = window.location.origin,
    state = crypto.randomUUID(),
    idOrigin = ID_ORIGIN_PROD,
    scopes,
  } = opts

  replaceUrl(`${idOrigin}/client/${clientId}/authorize`, {
    state,
    redirect: redirectUrl,
    scope: getScopesParams(scopes),
  })
}

/**
 * Parses the redirect URL after authorization.
 *
 * @returns Parsed data from the redirect URL.
 *
 * @example
 * const { state, accessToken, address } = parseRedirectUrl()
 */
export const parseRedirectUrl = () => {
  const url = new URL(window.location.href)

  const method = url.searchParams.get("method")
  if (method !== "auth") {
    throw "parseRedirectUrl: invalid method"
  }

  const type = url.searchParams.get("type")
  if (type !== "success") {
    throw "parseRedirectUrl: authorization failed"
  }

  const state = url.searchParams.get("state")
  const rawToken = url.searchParams.get("data")
  const rawAddress = url.searchParams.get("address") ?? undefined

  return {
    state,
    accessToken: rawToken,
    address: validateIdAddress(rawAddress),
  }
}
