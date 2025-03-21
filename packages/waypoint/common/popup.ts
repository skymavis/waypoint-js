import { UserRejectedRequestError } from "viem"

const DEFAULT_DIMENSIONS = {
  WIDTH: 480,
  HEIGHT: 720,
} as const

const DEFAULT_TITLE = "Ronin Waypoint" as const
const HASHED_PARAMS = new Set<string>(["data"])

type UrlParams = string | number | object | undefined | null
interface PopupConfig {
  width?: number
  height?: number
}

interface WindowPosition {
  left: number
  top: number
}

const calculateCenteredPosition = (width: number, height: number): WindowPosition => {
  const screenLeft = window.screenLeft ?? window.screenX
  const screenTop = window.screenTop ?? window.screenY
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  return {
    left: screenLeft + (screenWidth - width) / 2,
    top: screenTop + (screenHeight - height) / 2,
  }
}

export const buildUrlWithQuery = (inputUrl: string, query?: Record<string, UrlParams>): URL => {
  const url = new URL(inputUrl)
  if (!query) return url

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue

    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)

    if (HASHED_PARAMS.has(key)) {
      url.hash = `${key}=${encodeURIComponent(stringValue)}`
    } else {
      url.searchParams.set(key, stringValue)
    }
  }

  return url
}

export const openPopup = (
  inputUrl: string,
  query?: Record<string, UrlParams>,
  config?: PopupConfig,
): Window => {
  if (typeof window === "undefined" || !window.top) {
    throw new Error("Window environment not available")
  }

  const { width = DEFAULT_DIMENSIONS.WIDTH, height = DEFAULT_DIMENSIONS.HEIGHT } = config ?? {}

  const url = buildUrlWithQuery(inputUrl, query)
  const { left, top } = calculateCenteredPosition(width, height)

  const popup = window.open(
    url,
    DEFAULT_TITLE,
    `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`,
  )

  if (!popup) {
    throw new UserRejectedRequestError(new Error("Popup window is BLOCKED by the browser"))
  }

  popup.focus()
  return popup
}

export const replaceUrl = (inputUrl: string, query?: Record<string, UrlParams>): void => {
  if (typeof window === "undefined") return

  const url = buildUrlWithQuery(inputUrl, query)
  window.location.assign(url)
}
