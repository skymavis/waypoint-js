import { UserRejectedRequestError } from "viem"

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 720
const DEFAULT_TITLE = "Confirm your action!"

type UrlParams = string | number | object | undefined | null

export const openPopup = (inputUrl: string, query?: Record<string, UrlParams>) => {
  if (typeof window !== "undefined" && window.top) {
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - DEFAULT_WIDTH) / 2))
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - DEFAULT_HEIGHT) / 2))

    const url = new URL(inputUrl)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        value !== undefined && value !== null && url.searchParams.set(key, value.toString())
      })
    }

    const popup = window.open(
      url,
      DEFAULT_TITLE,
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
