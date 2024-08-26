import { RONIN_WAYPOINT_ORIGIN_PROD } from "./common/gate"
import { IdResponse } from "./common/id-response"
import { getScopesParams, Scope } from "./common/scope"
import { CommunicateHelper } from "./core/communicate"
import { openPopup, replaceUrl } from "./utils/popup"
import { validateIdAddress } from "./utils/validate-address"

/**
 * Options for authorizing a client.
 */
export type AuthorizeOpts = {
  /**
   * Client ID are used to identify your application for this integration.
   * You can find it in Developer Portal under Ronin Waypoint Service settings.
   */
  clientId: string

  /**
   * Ronin Waypoint environment - for testing only.
   * DO NOT override this value in production.
   */
  idOrigin?: string

  /**
   * Scopes are used by an application during authentication to authorize access to a user’s details, like name and picture.
   * openid (required; to indicate that the application intends to use OIDC to verify the user's identity)
   * profile (so you can personalize the email with the user's name)
   * email (so you know where to send the welcome email)
   * wallet (so you can request signing & sending transaction from the user's wallet)
   */
  scopes?: Scope[]

  /**
   * The URI of your application that users will be redirected to after authentication
   */
  redirectUrl?: string
}

export type RedirectAuthorizeOpts = AuthorizeOpts & {
  /**
   * The unique state to identify the request & response.
   */
  state?: string
}

/**
 * Authorize a user via Ronin Waypoint, returning an accessToken and user address.
 * This function will open a popup for authorization.
 *
 * @param opts Options for authorization.
 * @returns Authorization result including accessToken and user address.
 *
 * @example
 * import { authorize } from "@sky-mavis/waypoint"
 *
 * const { accessToken, address } = await authorize({
 *  clientId: "YOUR_CLIENT_ID",
 * })
 */
export const authorize = async (opts: AuthorizeOpts) => {
  const {
    clientId,
    idOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
    scopes,
    redirectUrl = window.location.origin,
  } = opts
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
 * Authorize a user via Ronin Waypoint in redirect mode, returning state, accessToken and user address.
 * This function will redirect the user to Ronin Waypoint for authorization.
 *
 * @param opts Options for redirect authorization.
 *
 * @example
 * import { redirectAuthorize } from "@sky-mavis/waypoint"
 *
 * const { state, accessToken, address } = await redirectAuthorize({
 *  clientId: "YOUR_CLIENT_ID",
 * })
 */
export const redirectAuthorize = (opts: RedirectAuthorizeOpts) => {
  const {
    clientId,
    redirectUrl = window.location.origin,
    state = crypto.randomUUID(),
    idOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
    scopes,
  } = opts

  replaceUrl(`${idOrigin}/client/${clientId}/authorize`, {
    state,
    redirect: redirectUrl,
    scope: getScopesParams(scopes),
  })
}

/**
 * Parse the redirect URL after authorization.
 * This function should be called in the redirect URL page.
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
