import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { openPopup, replaceUrl } from "../../common/popup"

describe("Popup and URL functions", () => {
  beforeEach(() => {
    // Mock screen properties
    globalThis.window.screenLeft = 0
    globalThis.window.screenTop = 0
    globalThis.window.innerWidth = 1024
    globalThis.window.innerHeight = 768

    globalThis.window.open = vi.fn(() => {
      const _window = window
      _window.focus = vi.fn()
      return _window
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("openPopup", () => {
    test("includes query parameters in the popup URL", () => {
      const mockUrl = "https://example.com"
      const queryParams = { foo: "bar", baz: "123" }
      openPopup(mockUrl, queryParams)

      const url = new URL(mockUrl)
      url.searchParams.set("foo", "bar")
      url.searchParams.set("baz", "123")

      expect(globalThis.window.open).toHaveBeenCalledWith(
        url,
        "_blank",
        `scrollbars=yes,width=480,height=720,top=24,left=272`,
      )
    })

    test("throws UserRejectedRequestError if popup is blocked", () => {
      vi.spyOn(globalThis.window, "open").mockImplementation(() => null)

      expect(() => openPopup("https://example.com")).toThrowError(
        "Popup window is BLOCKED by the browser",
      )
    })
  })

  describe("replaceUrl", () => {
    test("replaces the current URL with provided URL and query params", () => {
      Object.defineProperty(window, "location", {
        value: { assign: vi.fn() },
        writable: true,
      })

      const mockUrl = "https://example.com"
      const queryParams = { foo: "bar", baz: 123 }

      replaceUrl(mockUrl, queryParams)

      const url = new URL(mockUrl)
      url.searchParams.set("foo", "bar")
      url.searchParams.set("baz", "123")
      expect(window.location.assign).toBeCalledWith(url)
    })
  })
})
