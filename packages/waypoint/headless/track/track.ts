import { jwtDecode } from "jwt-decode"
import { v4 as uuidv4 } from "uuid"
import { sha256, stringToHex } from "viem"

import { version } from "../../common/version"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { ServerError } from "../error/server"
import { isProd } from "../utils/service-url"
import { ASAccessTokenPayload, WaypointTokenPayload } from "../utils/token"

const CONTENT_TYPE = "application/json"
const TRACK_URL = "https://x.skymavis.com/track"
const AUTHORIZATION_PROD = "Basic ODZkMTNkMmYtYWFmYy00M2YyLWJhZDctNDI2NTBiYmJmZTJlOg=="
const AUTHORIZATION_STAG = "Basic ZDU1ODQyODYtOWIwYS00MzE3LWI3YjktOWRjOTQwNmFiMzJlOg=="

export enum HeadlessEventName {
  backupShard = "backupShard",
  decryptShard = "decryptShard",
  keygen = "keygen",
  personalSign = "personalSign",
  signTypedData = "signTypedData",
  sendLegacyTransaction = "sendLegacyTransaction,",
  sendSponsoredTransaction = "sendSponsoredTransaction,",
}

type CommonProperties = {
  user_agent: string
  origin: string
  sdk_version: string
  wasm_version: string
  duration: number

  // * "client_id" from account service token
  client_id: string

  // * fields from waypoint token
  iss: string
  sub: string
  aud: string[]
}
type OkProperties = {
  request?: unknown
  response?: unknown
}
type ErrorProperties = {
  error_level: "error"
  error_type: "client_defined" | "server" | "client_unknown"
  error_name: string
  error_code: number
  error_message: string
  error_meta?: unknown
}

type TrackActionData =
  | {
      action: "ok"
      action_properties: OkProperties & CommonProperties
    }
  | {
      action: "error"
      action_properties: ErrorProperties & CommonProperties
    }

type TrackData = {
  uuid: string
  event: HeadlessEventName
  ref: string
  // * Format "YYYY-MM-DD HH:mm:ss"
  timestamp: string
  // * "sid" field from token
  session_id: string
  // * should increase by 1 for each event
  offset: number
  // * sha256(`${iss}:${sub}`)
  user_id: string
} & TrackActionData
type TrackEvent = {
  type: "track"
  data: TrackData
}

const track = (events: TrackEvent[], isProdEnv: boolean) => {
  const headers = new Headers({})
  headers.set("Authorization", isProdEnv ? AUTHORIZATION_PROD : AUTHORIZATION_STAG)
  headers.set("Content-Type", CONTENT_TYPE)
  headers.set("Accept", CONTENT_TYPE)

  const body = JSON.stringify({
    events,
  })

  return fetch(TRACK_URL, {
    method: "POST",
    headers,
    body,
  })
}

const TRACKING_OFFSET_KEY = "WAYPOINT.HEADLESS.TRACKING_OFFSET"
const getOffset = () => {
  const storageReady = typeof window !== "undefined" && "sessionStorage" in window

  if (!storageReady) return 0

  try {
    const currentOffset = parseInt(sessionStorage.getItem(TRACKING_OFFSET_KEY) ?? "0")
    const newOffset = currentOffset + 1

    sessionStorage.setItem(TRACKING_OFFSET_KEY, newOffset.toString())
    return currentOffset
  } catch (error) {
    return 0
  }
}
const getUTCTime = () => {
  const date = new Date()
  const timestamp = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`

  return timestamp
}
const toErrorProperties = (error: unknown): ErrorProperties => {
  if (error instanceof HeadlessClientError)
    return {
      error_level: "error",
      error_type: "client_defined",
      error_name: error.name,
      error_code: error.code,
      error_message: error.shortMessage,
    }

  if (error instanceof ServerError)
    return {
      error_level: "error",
      error_type: "server",
      error_name: error.name,
      error_code: error.code,
      error_message: error.shortMessage,
    }

  if (error instanceof Error)
    return {
      error_level: "error",
      error_type: "client_unknown",
      error_name: error.name,
      error_code: HeadlessClientErrorCode.UnknownError,
      error_message: error.message,
    }

  return {
    error_level: "error",
    error_type: "client_unknown",
    error_name: "UnknownError",
    error_code: HeadlessClientErrorCode.UnknownError,
    error_message: "Unknown error",
  }
}

type CreateTrackerParams = {
  event: HeadlessEventName
  waypointToken: string

  wasmUrl?: string
  productionFactor?: string | boolean
}
export const createTracker = (params: CreateTrackerParams) => {
  const { event, waypointToken, wasmUrl = "", productionFactor = false } = params
  const startTime = performance.now()
  const isProdEnv = isProd(productionFactor)

  const _getCommonData = () => {
    const endTime = performance.now()
    const duration = endTime - startTime
    const {
      iss = "",
      sub = "",
      sid = "",
      aud = [],
      client_id = "",
    } = jwtDecode<WaypointTokenPayload & ASAccessTokenPayload>(waypointToken)

    return {
      event,
      uuid: uuidv4(),
      offset: getOffset(),
      timestamp: getUTCTime(),
      session_id: sid,
      user_id: iss && sub ? sha256(stringToHex(`${iss}:${sub}`)) : "",
      ref: "",

      commonActionProperties: {
        aud,
        iss,
        sub,
        client_id,

        origin: window?.location?.origin ?? "",
        user_agent: navigator?.userAgent ?? "",
        sdk_version: version,
        wasm_version: wasmUrl,
        duration,
      },
    } as const
  }

  const trackOk = (okProperties: OkProperties) => {
    try {
      const { commonActionProperties, ...restCommonData } = _getCommonData()
      const { request, response } = okProperties

      const trackData: TrackData = {
        ...restCommonData,
        action: "ok",
        action_properties: {
          ...commonActionProperties,

          request,
          response,
        },
      }
      const trackEvent: TrackEvent = {
        type: "track",
        data: trackData,
      }

      track([trackEvent], isProdEnv)
    } catch (error) {
      /* empty */
    }
  }

  const trackError = (error: unknown) => {
    try {
      const { commonActionProperties, ...restCommonData } = _getCommonData()
      const errorProperties = toErrorProperties(error)

      const trackData: TrackData = {
        ...restCommonData,
        action: "error",
        action_properties: {
          ...commonActionProperties,
          ...errorProperties,
        },
      }
      const trackEvent: TrackEvent = {
        type: "track",
        data: trackData,
      }

      track([trackEvent], isProdEnv)
    } catch (error) {
      /* empty */
    }
  }

  return { trackOk, trackError }
}
