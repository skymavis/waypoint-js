import { UserRejectedRequestError } from "viem"

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 720

type UrlParams = string | number | object | undefined | null
type PopupConfig = {
  width?: number
  height?: number
}
export const HASHED_PARAMS = ["data"]

export const buildUrlWithQuery = (inputUrl: string, query?: Record<string, UrlParams>): URL => {
  const url = new URL(inputUrl)
  if (!query) return url
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    if (HASHED_PARAMS.includes(key)) {
      url.hash = `${key}=${encodeURIComponent(
        typeof value === "object" ? JSON.stringify(value) : value.toString(),
      )}`
      return
    }
    url.searchParams.set(key, value.toString())
  })
  return url
}

export const openPopup = (
  inputUrl: string,
  query?: Record<string, UrlParams>,
  config?: PopupConfig,
) => {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = config || {}
  if (typeof window !== "undefined" && window.top) {
    const screenLeft = window.screenLeft ?? window.screenX
    const screenTop = window.screenTop ?? window.screenY

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const left = screenLeft + (screenWidth - width) / 2
    const top = screenTop + (screenHeight - height) / 2

    const url = buildUrlWithQuery(inputUrl, query)

    const popup = window.open(
      url,
      "_blank",
      `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`,
    )

    if (!popup) {
      throw new UserRejectedRequestError(new Error("Popup window is BLOCKED by the browser"))
    }

    popup.focus()
    return popup
  }
}

export const replaceUrl = (inputUrl: string, query?: Record<string, UrlParams>) => {
  const url = buildUrlWithQuery(inputUrl, query)
  window.location.assign(url)
}
