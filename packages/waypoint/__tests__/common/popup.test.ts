import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { buildUrlWithQuery, openPopup, replaceUrl } from "../../common/popup"

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

  describe("buildUrlWithQuery", () => {
    test("returns the original URL when no query is provided", () => {
      const inputUrl = "https://example.com/"
      const result = buildUrlWithQuery(inputUrl)
      expect(result.toString()).toBe(inputUrl)
    })

    test("appends query parameters to the URL", () => {
      const inputUrl = "https://example.com"
      const query = { foo: "bar", baz: "qux" }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe("https://example.com/?foo=bar&baz=qux")
    })

    test("skips null or undefined values in query", () => {
      const inputUrl = "https://example.com"
      const query = { foo: "bar", baz: null, qux: undefined }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe("https://example.com/?foo=bar")
    })

    test("adds hashed parameters to the URL hash", () => {
      const inputUrl = "https://example.com"
      const query = { data: "value", foo: "bar" }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe("https://example.com/?foo=bar#data=value")
    })

    test("encodes objects as JSON strings", () => {
      const inputUrl = "https://example.com"
      const query = { data: { key: "value" }, foo: "bar" }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe(
        "https://example.com/?foo=bar#data=%7B%22key%22%3A%22value%22%7D",
      )
    })

    test("handles a mix of hashed and regular parameters", () => {
      const inputUrl = "https://example.com"
      const query = { data: "hashValue", foo: "bar", baz: "qux" }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe("https://example.com/?foo=bar&baz=qux#data=hashValue")
    })

    test("preserves existing search parameters in the input URL", () => {
      const inputUrl = "https://example.com/?existing=param"
      const query = { foo: "bar" }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe("https://example.com/?existing=param&foo=bar")
    })

    test("overwrites existing search parameters if they conflict", () => {
      const inputUrl = "https://example.com/?foo=oldValue"
      const query = { foo: "newValue" }
      const result = buildUrlWithQuery(inputUrl, query)
      expect(result.toString()).toBe("https://example.com/?foo=newValue")
    })
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
        "Ronin Waypoint",
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
