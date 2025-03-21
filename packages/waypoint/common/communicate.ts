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
  private readonly pendingEvents = new Map<string, Deferred>()
  private readonly windowMonitorIntervals = new Map<string, NodeJS.Timeout>()
  private readonly origin!: string
  private readonly eventHandler!: (event: MessageEvent) => void

  constructor(origin: string) {
    if (typeof window === "undefined") return
    this.origin = origin
    this.eventHandler = this.handleEvent.bind(this)
    this.initializeEventListeners()
  }

  private initializeEventListeners(): void {
    window.addEventListener("message", this.eventHandler)
    window.addEventListener("beforeunload", this.cleanup.bind(this), { once: true })
  }

  private handleEvent(event: MessageEvent): void {
    if (event.origin !== this.origin) return
    const message = event.data
    if (!this.isValidCallbackMessage(message)) return
    this.processCallbackMessage(message)
  }

  private isValidCallbackMessage(message: unknown): message is CallbackMessage {
    return (
      message !== null &&
      typeof message === "object" &&
      "state" in message &&
      "type" in message &&
      (message.type === "success" || message.type === "fail")
    )
  }

  private processCallbackMessage(message: CallbackMessage): void {
    const { state: requestId, type } = message
    const deferred = this.pendingEvents.get(requestId)
    if (!deferred) return

    this.clearMonitoring(requestId)

    switch (type) {
      case "fail": {
        const error = normalizeWaypointError(message.error)
        deferred.reject(error)
        break
      }
      case "success": {
        const parsedData = this.parseSuccessResponse(message.data)
        deferred.resolve(parsedData)
        break
      }
    }

    this.pendingEvents.delete(requestId)
  }

  private parseSuccessResponse(data: string | object): unknown {
    if (typeof data !== "string") return data
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }

  private clearMonitoring(requestId: string): void {
    const interval = this.windowMonitorIntervals.get(requestId)
    if (interval) {
      clearInterval(interval)
      this.windowMonitorIntervals.delete(requestId)
    }
  }

  private monitorWindowClosing(targetWindow: Window, requestId: string): void {
    this.clearMonitoring(requestId)

    const interval = setInterval(() => {
      if (
        targetWindow.closed &&
        this.pendingEvents.has(requestId) &&
        // Note: Prevent multiple executions in React Strict Mode
        this.windowMonitorIntervals.has(requestId)
      ) {
        this.processCallbackMessage({
          state: requestId,
          type: "fail",
          error: WaypointErrorMap.WALLET_USER_CANCEL,
        })
      }
    }, DELAY_INTERVAL)

    this.windowMonitorIntervals.set(requestId, interval)
  }

  public sendRequest<T>(action: (requestId: string) => Window | undefined): Promise<T> {
    const requestId = uuidv4()
    const deferred = new Deferred<T>()
    this.pendingEvents.set(requestId, deferred)
    const targetWindow = action(requestId)
    if (targetWindow) {
      this.monitorWindowClosing(targetWindow, requestId)
    }
    return deferred.promise
  }
  public cleanup(): void {
    if (typeof window === "undefined") return
    window.removeEventListener("message", this.eventHandler)
    this.windowMonitorIntervals.forEach(clearInterval)
    this.windowMonitorIntervals.clear()
    const cleanupError = new Error("Communication cleanup")
    this.pendingEvents.forEach(deferred => deferred.reject(cleanupError))
    this.pendingEvents.clear()
  }
}
