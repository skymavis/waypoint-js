import { Deferred } from "../utils/defer"
import { normalizeIdError } from "../utils/error"

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
      data: string
    }
)

const DELAY_INTERVAL = 1000

export class CommunicateHelper {
  protected readonly pendingRequests: Map<string, Deferred> = new Map()
  protected readonly pendingIntervals: Map<string, number | NodeJS.Timeout> = new Map()
  protected readonly origin: string = ""

  constructor(origin: string) {
    if (typeof window === "undefined") return

    this.origin = origin

    const eventHandler = (event: MessageEvent) => {
      if (event.origin !== this.origin) return

      const callbackMessage = event.data

      if (!callbackMessage.state) return

      this.handleResponse(callbackMessage)
    }

    window.addEventListener("message", eventHandler)
    window.addEventListener("beforeunload", () => {
      window.removeEventListener("message", eventHandler)
    })
  }

  handleResponse(callbackMessage: CallbackMessage) {
    const { state: id, type } = callbackMessage

    const responseHandler = this.pendingRequests.get(id)
    const intervalHandler = this.pendingIntervals.get(id)

    if (!responseHandler || !(typeof responseHandler !== "function")) return

    if (intervalHandler) {
      this.pendingIntervals.delete(id)
      clearInterval(intervalHandler)
    }

    this.pendingRequests.delete(id)

    switch (type) {
      case "fail": {
        const err = normalizeIdError(callbackMessage.error)

        return responseHandler.reject(err)
      }

      default: {
        const objectOrStringData = (() => {
          try {
            return JSON.parse(callbackMessage.data)
          } catch {
            return callbackMessage.data
          }
        })()

        return responseHandler.resolve(objectOrStringData)
      }
    }
  }

  private monitorWindowClosing = (params: { window: Window; requestId: string }) => {
    const { requestId, window } = params

    const error = {
      code: 1000,
      message: "User rejected",
    }

    const intervalId = setInterval(() => {
      const intervalHandler = this.pendingIntervals.get(requestId)

      if (window?.closed && intervalHandler) {
        this.handleResponse({
          state: requestId,
          type: "fail",
          error,
        })
      }
    }, DELAY_INTERVAL)

    this.pendingIntervals.set(requestId, intervalId)
  }

  sendRequest<T>(action: (requestId: string) => Window | undefined): Promise<T> {
    const id = crypto.randomUUID()
    const responseHandler = new Deferred<T>()

    this.pendingRequests.set(id, responseHandler)

    const referencedWindow = action(id)

    if (referencedWindow) {
      this.monitorWindowClosing({
        window: referencedWindow,
        requestId: id,
      })
    }

    return responseHandler.promise
  }
}
