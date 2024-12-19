import { fromBinary } from "@bufbuild/protobuf"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { Frame, FrameSchema } from "../../proto/rpc"

const DEFAULT_TIMEOUT = 5_000

export const openSocket = (url: string, timeout = DEFAULT_TIMEOUT): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url)

    socket.binaryType = "arraybuffer"
    socket.onopen = () => {
      resolve(socket)
    }

    setTimeout(() => {
      reject(
        new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.OpenSocketError,
          message: `Unable to open WebSocket with url="${url}". The connection has reached the timeout="${timeout}ms".`,
        }),
      )
    }, timeout)
  })
}

export const createFrameQueue = (socket: WebSocket) => {
  const messageQueue: Array<Uint8Array> = []
  const messageQueueEvent = new EventTarget()

  const enqueueCallback = (event: MessageEvent<ArrayBuffer>) => {
    messageQueue.push(new Uint8Array(event.data))

    messageQueueEvent.dispatchEvent(new Event("enqueue"))
  }
  socket.onmessage = enqueueCallback

  const waitAndDequeue = (timeout = DEFAULT_TIMEOUT) => {
    return new Promise<Frame>((resolve, reject) => {
      setTimeout(() => {
        reject(
          new HeadlessClientError({
            cause: undefined,
            code: HeadlessClientErrorCode.ListenSocketMessageError,
            message: `Unable to retrieve message from WebSocket. The progress has reached the timeout="${timeout}ms".`,
          }),
        )
      }, timeout)

      // * already have message in queue
      const first = messageQueue.shift()
      if (first !== undefined) {
        const stepFrame = fromBinary(FrameSchema, first)
        resolve(stepFrame)

        return
      }

      // * listen for new message
      const onEnqueue = () => {
        const first = messageQueue.shift()

        if (first !== undefined) {
          messageQueueEvent.removeEventListener("enqueue", onEnqueue)

          const stepFrame = fromBinary(FrameSchema, first)
          resolve(stepFrame)
        }
      }
      messageQueueEvent.addEventListener("enqueue", onEnqueue)
    })
  }

  return { waitAndDequeue, messageQueue }
}
