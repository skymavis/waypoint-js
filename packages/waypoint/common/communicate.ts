import { v4 as uuidv4 } from "uuid"

import { Deferred } from "./defer"
import { normalizeWaypointError, WaypointErrorMap } from "./waypoint-error"

const DELAY_INTERVAL = 1_000

export type CallbackMessage = {
  state: string
} & (
  | {
      type: "fail"
      error: {
        code: number
        message: string
      }
    }
  | {
      type: "success"
      data: string | object
    }
)

export class CommunicateHelper {
  private readonly pendingEvents: Map<string, Deferred> = new Map()
  private readonly windowMonitorIntervals: Map<string, number | NodeJS.Timeout> = new Map()
  private readonly origin!: string
  private readonly eventHandler!: (event: MessageEvent) => void

  constructor(origin: string) {
    if (typeof window === "undefined") {
      // eslint-disable-next-line no-console
      console.warn("CommunicateHelper can only be used in browser environment")
      return
    }

    this.origin = origin
    this.eventHandler = this.createEventHandler()
    this.initializeEventListeners()
  }

  private createEventHandler(): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
      if (event.origin !== this.origin) return

      const callbackMessage = event.data as CallbackMessage
      if (!this.isValidCallbackMessage(callbackMessage)) return

      this.handleResponse(callbackMessage)
    }
  }

  private isValidCallbackMessage(message: unknown): message is CallbackMessage {
    return (
      typeof message === "object" && message !== null && "state" in message && "type" in message
    )
  }

  private initializeEventListeners() {
    window.addEventListener("message", this.eventHandler)
    window.addEventListener("beforeunload", () => {
      this.cleanup()
    })
  }

  handleResponse(message: CallbackMessage) {
    const { state: requestId, type } = message

    const deferredPromise = this.pendingEvents.get(requestId)
    const monitorInterval = this.windowMonitorIntervals.get(requestId)

    if (!deferredPromise || !(typeof deferredPromise !== "function")) return

    if (monitorInterval) {
      this.windowMonitorIntervals.delete(requestId)
      clearInterval(monitorInterval)
    }

    this.pendingEvents.delete(requestId)

    switch (type) {
      case "fail": {
        const err = normalizeWaypointError(message.error)
        return deferredPromise.reject(err)
      }

      default: {
        const objectOrStringData = this.parseSuccessResponse(message.data)
        return deferredPromise.resolve(objectOrStringData)
      }
    }
  }

  private parseSuccessResponse(data: string | object) {
    try {
      return typeof data === "string" ? JSON.parse(data) : data
    } catch {
      return data
    }
  }

  private monitorWindowClosing(params: { window: Window; requestId: string }) {
    const { requestId, window: targetWindow } = params

    const monitorInterval = setInterval(() => {
      if (targetWindow?.closed && this.hasPendingRequest(requestId)) {
        this.handleResponse({
          state: requestId,
          type: "fail",
          error: WaypointErrorMap.WALLET_USER_CANCEL,
        })
      }
    }, DELAY_INTERVAL)

    this.windowMonitorIntervals.set(requestId, monitorInterval)
  }

  private hasPendingRequest(requestId: string) {
    return this.pendingEvents.has(requestId) && this.windowMonitorIntervals.has(requestId)
  }

  public sendRequest<T>(action: (requestId: string) => Window | undefined): Promise<T> {
    const id = uuidv4()
    const responseHandler = new Deferred<T>()

    this.pendingEvents.set(id, responseHandler)

    const referencedWindow = action(id)
    if (referencedWindow) {
      this.monitorWindowClosing({
        window: referencedWindow,
        requestId: id,
      })
    }

    return responseHandler.promise
  }

  public cleanup() {
    window.removeEventListener("message", this.eventHandler)
    this.windowMonitorIntervals.forEach(interval => clearInterval(interval))
    this.windowMonitorIntervals.clear()
    this.pendingEvents.clear()
  }
}
