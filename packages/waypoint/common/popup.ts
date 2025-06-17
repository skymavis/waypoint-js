import { UserRejectedRequestError } from "viem"

import { Snackbar } from "./Snackbar"

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 720
const DEFAULT_TITLE = "Ronin Waypoint"

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

export const openPopup = async (
  inputUrl: string,
  query?: Record<string, UrlParams>,
  config?: PopupConfig,
): Promise<Window> => {
  if (typeof window === "undefined" || !window.top)
    return Promise.reject(new Error("openPopup: window is not available"))

  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = config || {}
  const screenLeft = window.screenLeft ?? window.screenX
  const screenTop = window.screenTop ?? window.screenY
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const left = screenLeft + (screenWidth - width) / 2
  const top = screenTop + (screenHeight - height) / 2
  const url = buildUrlWithQuery(inputUrl, query)

  const tryOpenPopup = (): Window | null => {
    const popup = window.open(
      url,
      DEFAULT_TITLE,
      `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`,
    )
    popup?.focus()
    if (!popup) return null
    return popup
  }

  let popup = tryOpenPopup()

  if (!popup) {
    return new Promise<Window>((resolve, reject) => {
      const snackbar = Snackbar.getInstance()
      snackbar.show({
        title: "Popup was blocked by the browser",
        message: "Click 'Retry' to attempt opening it again.",
        action: {
          label: "Retry",
          onClick: () => {
            popup = tryOpenPopup()
            if (popup) resolve(popup)
            if (!popup)
              reject(
                new UserRejectedRequestError(new Error("Popup window is BLOCKED by the browser")),
              )
          },
        },
        onClose: () => {
          reject(new UserRejectedRequestError(new Error("Popup window is BLOCKED by the browser")))
        },
      })
    })
  }

  return Promise.resolve(popup)
}

export const replaceUrl = (inputUrl: string, query?: Record<string, UrlParams>) => {
  const url = buildUrlWithQuery(inputUrl, query)
  window.location.assign(url)
}
