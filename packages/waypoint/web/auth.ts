import { v4 as uuidv4 } from "uuid"
import { Address } from "viem"

import { ChecksType } from "../common/checks"
import { CommunicateHelper } from "../common/communicate"
import { generateCodeChallenge, generateRandomString } from "../common/crypto"
import { RONIN_WAYPOINT_ORIGIN_PROD } from "../common/gate"
import { openPopup, replaceUrl } from "../common/popup"
import { getScopesParams, Scope } from "../common/scope"
import { Includes } from "../common/type-utils"
import { WaypointPKCEResponse, WaypointResponse } from "./common/waypoint-response"
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
   * Scopes are used by an application during authentication to authorize access to a user's details.
   * openid (required; to indicate that the application intends to use OIDC to verify the user's identity)
   * profile (so you can personalize the email with the user's name)
   * email (so you know where to send the welcome email)
   * wallet (so you can request signing & sending transaction from the user's wallet)
   */
  scopes?: Scope[]

  /**
   * Contains parameters you have to match against the request to make sure it is valid.
   */
  checks?: ChecksType[]

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

export type PKCEPopupAuthorizeData = {
  authorizationCode: string
  codeVerifier: string
}

export type PKCERedirectAuthorizeData = {
  codeVerifier: string
}

export type AuthorizeData<T extends PopupAuthorizeOpts | RedirectAuthorizeOpts> =
  T extends PopupAuthorizeOpts
    ? Includes<T["checks"], "pkce"> extends true
      ? PKCEPopupAuthorizeData
      : PopupAuthorizeData
    : T extends RedirectAuthorizeOpts
      ? Includes<T["checks"], "pkce"> extends true
        ? PKCERedirectAuthorizeData
        : undefined
      : never

const getPKCEParams = (usePKCE: boolean) => {
  if (!usePKCE) return {}
  const codeVerifier = generateRandomString()
  return {
    response_type: "code",
    code_challenge_algo: "S256",
    code_challenge: generateCodeChallenge(codeVerifier),
    codeVerifier,
  }
}

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
    checks = [],
    waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
    redirectUrl = window.location.origin,
  } = opts

  const isPKCE = checks.includes("pkce")
  const { codeVerifier, ...pkceParams } = getPKCEParams(isPKCE)

  if (mode === "redirect") {
    replaceUrl(`${waypointOrigin}/client/${clientId}/authorize`, {
      redirect: redirectUrl,
      state: opts.state ?? uuidv4(),
      scope: getScopesParams(scopes),
      ...pkceParams,
    })
    return (
      isPKCE
        ? {
            codeVerifier,
          }
        : undefined
    ) as AuthorizeData<T>
  }

  const helper = new CommunicateHelper(waypointOrigin)

  if (isPKCE) {
    const pkceAuthData = await helper.sendRequest<WaypointPKCEResponse>(state =>
      openPopup(`${waypointOrigin}/client/${clientId}/authorize`, {
        state,
        redirect: redirectUrl,
        origin: window.location.origin,
        scope: getScopesParams(scopes),
        ...pkceParams,
      }),
    )

    return {
      codeVerifier: codeVerifier!,
      authorizationCode: pkceAuthData.authorization_code,
    } as AuthorizeData<T>
  }

  const authData = await helper.sendRequest<WaypointResponse>(state =>
    openPopup(`${waypointOrigin}/client/${clientId}/authorize`, {
      state,
      redirect: redirectUrl,
      origin: window.location.origin,
      scope: getScopesParams(scopes),
      ...pkceParams,
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
  const authorizationCode = url.searchParams.get("authorization_code")

  return {
    state,
    authorizationCode,
    token: rawToken,
    address: validateIdAddress(rawAddress),
    secondaryAddress: validateIdAddress(secondaryAddress),
    auth: validateIdAddress(secondaryAddress),
  }
}
