import { v4 as uuidv4 } from "uuid"
import { Address } from "viem"

import { CommunicateHelper } from "../common/communicate"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "../common/gate"
import { openPopup, replaceUrl } from "../common/popup"
import { getScopesParams, Scope } from "../common/scope"
import { WaypointResponse } from "./common/waypoint-response"
import { validateIdAddress } from "./utils/validate-address"

/**
 * Options for authorizing a client.
 */
export type BaseAuthorizeOpts = {
  /**
   * Client ID are used to identify your application for this integration.
   * You can find it in Developer Portal under Ronin Waypoint Service settings.
   */
  clientId: string

  /**
   * Ronin Waypoint environment - for testing only.
   * DO NOT override this value in production.
   */
  waypointOrigin?: string

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

export type PopupAuthorizeOpts = BaseAuthorizeOpts & {
  /**
   * Authorize the user via a popup.
   */
  mode: "popup"
}

export type RedirectAuthorizeOpts = BaseAuthorizeOpts & {
  /**
   * Redirect the user to the authorization page.
   */
  mode: "redirect"

  /**
   * The unique state to identify the request & response.
   */
  state?: string
}

export type PopupAuthorizeData = {
  token: string
  address: Address | undefined
  secondaryAddress: Address | undefined
}

export type AuthorizeData<T> = T extends PopupAuthorizeOpts ? PopupAuthorizeData : undefined

/**
 * Authorize a user via Ronin Waypoint, returning an token and user address.
 *
 * @param opts Options for authorization.
 * @returns Authorization result including token and user addresses, or undefined in case of redirect.
 *
 * @example
 * import { authorize } from "@sky-mavis/waypoint"
 *
 * const { token, address } = await authorize({
 *  mode: "popup",
 *  clientId: "YOUR_CLIENT_ID",
 * })
 */
export const authorize = async <T extends PopupAuthorizeOpts | RedirectAuthorizeOpts>(
  opts: T,
): Promise<AuthorizeData<T>> => {
  const {
    mode,
    clientId,
    scopes,
    waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
    redirectUrl = window.location.origin,
  } = opts

  if (mode === "redirect") {
    replaceUrl(`${waypointOrigin}/client/${clientId}/authorize`, {
      redirect: redirectUrl,
      state: opts.state ?? uuidv4(),
      scope: getScopesParams(scopes),
    })
    return undefined as AuthorizeData<T>
  }

  const helper = new CommunicateHelper(waypointOrigin)

  const authData = await helper.sendRequest<WaypointResponse>(state =>
    openPopup(`${waypointOrigin}/client/${clientId}/authorize`, {
      state,
      redirect: redirectUrl,
      origin: window.location.origin,
      scope: getScopesParams(scopes),
    }),
  )

  const {
    id_token: token,
    address: rawAddress,
    secondary_address: secondaryAddress,
  } = authData ?? {}

  return {
    token,
    address: validateIdAddress(rawAddress),
    secondaryAddress: validateIdAddress(secondaryAddress),
  } as AuthorizeData<T>
}

/**
 * Parse the redirect URL after authorization.
 * This function should be called in the redirect URL page.
 *
 * @returns Parsed data from the redirect URL.
 *
 * @example
 * const { state, token, address } = parseRedirectUrl()
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
  const rawAddress = url.searchParams.get("address")
  const secondaryAddress = url.searchParams.get("secondary_address")

  return {
    state,
    token: rawToken,
    address: validateIdAddress(rawAddress),
    secondaryAddress: validateIdAddress(secondaryAddress),
  }
}
