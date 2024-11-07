/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals"

import { CallbackMessage, CommunicateHelper, RequestAction } from "../../core/communicate"

describe("CommunicateHelper", () => {
  const mockOrigin = "https://test.com"
  let communicateHelper: CommunicateHelper
  let mockWindow: Partial<typeof window>
  let addEventListenerSpy: jest.Spied<typeof window.addEventListener>
  let removeEventListenerSpy: jest.Spied<typeof window.removeEventListener>

  beforeEach(() => {
    // Mock window object
    mockWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      closed: false,
    }
    global.window = mockWindow as any
    global.crypto = { randomUUID: () => "81cb492d-271a-4447-b96e-04df46bb902d" } as any

    addEventListenerSpy = jest.spyOn(window, "addEventListener")
    removeEventListenerSpy = jest.spyOn(window, "removeEventListener")

    communicateHelper = new CommunicateHelper(mockOrigin)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("constructor", () => {
    it("should set up message and beforeunload event listeners", () => {
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
      expect(addEventListenerSpy).toHaveBeenCalledWith("message", expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
    })

    it("should do nothing if window is undefined", () => {
      global.window = undefined as any
      const helper = new CommunicateHelper(mockOrigin)
      // @ts-ignore - accessing protected property for testing
      expect(helper.origin).toBe("")
    })
  })

  describe("handleResponse", () => {
    let mockDeferred: any

    beforeEach(() => {
      mockDeferred = {
        resolve: jest.fn(),
        reject: jest.fn(),
      }
      // @ts-ignore - accessing protected property for testing
      communicateHelper.pendingRequests.set("test-id", mockDeferred)
    })

    it("should handle success response with JSON data", () => {
      const successMessage: CallbackMessage = {
        state: "test-id",
        type: "success",
        data: JSON.stringify({ foo: "bar" }),
      }

      communicateHelper.handleResponse(successMessage)

      expect(mockDeferred.resolve).toHaveBeenCalledWith({ foo: "bar" })
      // @ts-ignore - accessing protected property for testing
      expect(communicateHelper.pendingRequests.size).toBe(0)
    })

    it("should handle success response with string data", () => {
      const successMessage: CallbackMessage = {
        state: "test-id",
        type: "success",
        data: "plain text",
      }

      communicateHelper.handleResponse(successMessage)

      expect(mockDeferred.resolve).toHaveBeenCalledWith("plain text")
    })

    it("should handle fail response", () => {
      const failMessage: CallbackMessage = {
        state: "test-id",
        type: "fail",
        error: {
          code: 1000,
          message: "Test error",
        },
      }

      communicateHelper.handleResponse(failMessage)

      expect(mockDeferred.reject).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 1000,
          message: "Test error",
        }),
      )
    })

    it("should clear interval if exists", () => {
      const intervalId = 123
      // @ts-ignore - accessing protected property for testing
      communicateHelper.pendingIntervals.set("test-id", intervalId)
      jest.spyOn(global, "clearInterval")

      const successMessage: CallbackMessage = {
        state: "test-id",
        type: "success",
        data: "test",
      }

      communicateHelper.handleResponse(successMessage)

      expect(clearInterval).toHaveBeenCalledWith(intervalId)
      // @ts-ignore - accessing protected property for testing
      expect(communicateHelper.pendingIntervals.size).toBe(0)
    })
  })

  describe("sendRequest", () => {
    it("should create new request and return promise", async () => {
      const mockWindow = { closed: false }
      const action = jest.fn().mockReturnValue(mockWindow) as RequestAction

      const promise = communicateHelper.sendRequest(action)

      expect(action).toHaveBeenCalledWith("123-456")
      // @ts-ignore - accessing protected property for testing
      expect(communicateHelper.pendingRequests.size).toBe(1)
      // @ts-ignore - accessing protected property for testing
      expect(communicateHelper.pendingIntervals.size).toBe(1)

      // Resolve the request
      const successMessage: CallbackMessage = {
        state: "123-456",
        type: "success",
        data: JSON.stringify({ result: "success" }),
      }
      communicateHelper.handleResponse(successMessage)

      const result = await promise
      expect(result).toEqual({ result: "success" })
    })

    it("should not set up window monitoring if no window is returned", () => {
      const action = jest.fn().mockReturnValue(undefined) as RequestAction

      communicateHelper.sendRequest(action)

      // @ts-ignore - accessing protected property for testing
      expect(communicateHelper.pendingIntervals.size).toBe(0)
    })
  })

  describe("window closing monitor", () => {
    it("should handle window closing", done => {
      const mockWindow = { closed: false }
      const action = jest.fn().mockReturnValue(mockWindow) as RequestAction

      communicateHelper.sendRequest(action).catch(error => {
        expect(error).toEqual(
          expect.objectContaining({
            code: 1000,
            message: "User rejected",
          }),
        )
        done()
      })

      // Simulate window closing
      mockWindow.closed = true

      // Fast-forward timers
      jest.advanceTimersByTime(1000)
    })
  })
})
