import { UserRejectedRequestError } from "viem"

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 720

type UrlParams = string | number | object | undefined | null

export const openPopup = (inputUrl: string, query?: Record<string, UrlParams>) => {
  if (typeof window !== "undefined" && window.top) {
    const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
    const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const left = screenLeft + (screenWidth - DEFAULT_WIDTH) / 2
    const top = screenTop + (screenHeight - DEFAULT_HEIGHT) / 2

    const url = new URL(inputUrl)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        value !== undefined && value !== null && url.searchParams.set(key, value.toString())
      })
    }

    const popup = window.open(
      url,
      `_blank`,
      `
        scrollbars=yes,
        width=${DEFAULT_WIDTH},
        height=${DEFAULT_HEIGHT},
        top=${top},
        left=${left}
      `,
    )

    if (!popup) {
      const err = new Error("Popup window is BLOCKED by the browser")
      throw new UserRejectedRequestError(err)
    }

    popup.focus()
    return popup
  }
}

export const replaceUrl = (inputUrl: string, query?: Record<string, UrlParams>) => {
  const url = new URL(inputUrl)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      value !== undefined && value !== null && url.searchParams.set(key, value.toString())
    })
  }

  window.location.assign(url)
}
