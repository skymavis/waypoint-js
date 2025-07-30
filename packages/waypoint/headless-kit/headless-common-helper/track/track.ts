import { jwtDecode } from "jwt-decode"
import { v4 as uuidv4 } from "uuid"
import { sha256, stringToHex } from "viem"

import { version } from "../../../common/version"
import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorCode,
  ServerBaseError,
} from "../error/base"
import { ASAccessTokenPayload, WaypointTokenPayload } from "../utils/token"

const CONTENT_TYPE = "application/json"
const TRACK_URL = "https://x.skymavis.com/track"
const AUTHORIZATION_PROD = "Basic ODZkMTNkMmYtYWFmYy00M2YyLWJhZDctNDI2NTBiYmJmZTJlOg=="
const AUTHORIZATION_STAG = "Basic ZDU1ODQyODYtOWIwYS00MzE3LWI3YjktOWRjOTQwNmFiMzJlOg=="

export type CommonPropertiesBase<T extends object | unknown = unknown> = {
  user_agent: string
  origin: string
  sdk_version: string
  duration: number

  // * "client_id" from account service token
  client_id: string

  // * fields from waypoint token
  iss: string
  sub: string
  aud: string[]
} & T

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

type TrackActionData<T extends object | unknown = unknown> =
  | {
      action: "ok"
      action_properties: OkProperties & CommonPropertiesBase<T>
    }
  | {
      action: "error"
      action_properties: ErrorProperties & CommonPropertiesBase<T>
    }

type TrackData<T extends object | unknown = unknown, E = unknown> = {
  uuid: string
  event: E
  ref: string
  // * Format "YYYY-MM-DD HH:mm:ss"
  timestamp: string
  // * "sid" field from token
  session_id: string
  // * should increase by 1 for each event
  offset: number
  // * sha256(`${iss}:${sub}`)
  user_id: string
} & TrackActionData<T>

type TrackEvent<T extends object | unknown = unknown, E = unknown> = {
  type: "track"
  data: TrackData<T, E>
}

const track = <T extends object | unknown = unknown, E = unknown>(
  events: TrackEvent<T, E>[],
  isProdEnv: boolean,
) => {
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
  if (error instanceof HeadlessBaseClientError)
    return {
      error_level: "error",
      error_type: "client_defined",
      error_name: error.name,
      error_code: error.code,
      error_message: error.shortMessage,
    }

  if (error instanceof ServerBaseError)
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
      error_code: HeadlessBaseClientErrorCode.UnknownError,
      error_message: error.message,
    }

  return {
    error_level: "error",
    error_type: "client_unknown",
    error_name: "UnknownError",
    error_code: HeadlessBaseClientErrorCode.UnknownError,
    error_message: "Unknown error",
  }
}

export type CreateBaseTrackerParams<T extends object = object, E = unknown> = {
  event: E
  waypointToken: string
  isProdEnv: boolean
} & T

export const createBaseTracker = <T extends object = object, E = unknown>(
  params: CreateBaseTrackerParams<T, E>,
) => {
  const { event, waypointToken, isProdEnv, ...rest } = params
  const startTime = performance.now()

  const _getCommonData = () => {
    const castRest = { ...rest } as T

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
        duration,
        ...castRest,
      },
    }
  }

  const trackOk = (okProperties: OkProperties) => {
    try {
      const { commonActionProperties, ...restCommonData } = _getCommonData()
      const { request, response } = okProperties

      const trackData: TrackData<T, E> = {
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
