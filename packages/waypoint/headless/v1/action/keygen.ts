import { bytesToJson } from "../../common/utils/convertor"
import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { createTracker, HeadlessEventName } from "../track/track"
import { type ActionHandler, type KeygenHandlerDoResponse } from "../wasm/types"
import { decodeAuthenticateData, sendAuthenticate } from "./helpers/authenticate"
import { wasmGetKeygenHandler } from "./helpers/get-keygen-handler"
import { createFrameQueue, openSocket } from "./helpers/open-socket"
import {
  decodeProtocolDataAndTransferToWasm,
  decodeSessionAndTransferToWasm,
  sendProtocolData,
  wasmGetProtocolData,
} from "./helpers/send-round-data"

const wasmTriggerKeygen = async (keygenHandler: ActionHandler) => {
  try {
    const doResponse = await keygenHandler.do("")
    const result = bytesToJson(doResponse) as KeygenHandlerDoResponse

    return result
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmTriggerKeygenError,
      message: `Unable to trigger the WASM keygen process. This could be due to a wrong version of WASM.`,
    })
  }
}

export type KeygenParams = {
  waypointToken: string

  wasmUrl: string
  wsUrl: string
}

const _keygen = async (params: KeygenParams): Promise<string> => {
  const {
    waypointToken,

    wasmUrl,
    wsUrl,
  } = params
  console.debug("🔐 KEYGEN: start")

  const keygenHandler = await wasmGetKeygenHandler(wasmUrl)
  console.debug("🔐 KEYGEN: wasm is ready")

  const socket = await openSocket(`${wsUrl}/v1/public/ws/keygen`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔐 KEYGEN: socket is ready")

  try {
    sendAuthenticate(socket, waypointToken)
    const authFrame = await waitAndDequeue()
    const authData = decodeAuthenticateData(authFrame)
    console.debug("🔐 KEYGEN: authenticated", authData.uuid)

    const keygenResultPromise = wasmTriggerKeygen(keygenHandler)
    console.debug("🔐 KEYGEN: trigger wasm keygen")

    const sessionFrame = await waitAndDequeue()
    decodeSessionAndTransferToWasm(keygenHandler, sessionFrame)

    const socketR1 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(keygenHandler, socketR1)
    console.debug("🔐 KEYGEN: socket - round 1")

    const wasmR1 = await wasmGetProtocolData(keygenHandler)
    sendProtocolData(socket, wasmR1)
    console.debug("🔐 KEYGEN: wasm - round 1")

    const socketR2 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(keygenHandler, socketR2)
    console.debug("🔐 KEYGEN: socket - round 2")

    const wasmR2 = await wasmGetProtocolData(keygenHandler)
    sendProtocolData(socket, wasmR2)
    console.debug("🔐 KEYGEN: wasm - round 2")

    const socketR3 = await waitAndDequeue()
    decodeProtocolDataAndTransferToWasm(keygenHandler, socketR3)
    console.debug("🔐 KEYGEN: socket - round 3")

    const keygenResult = await keygenResultPromise
    console.debug("🔐 KEYGEN: done")
    return keygenResult.data.key
  } finally {
    socket.close()
  }
}

export const keygen = async (params: KeygenParams): Promise<string> => {
  const { waypointToken, wasmUrl, wsUrl } = params
  const tracker = createTracker({
    event: HeadlessEventName.keygen,
    waypointToken,
    productionFactor: wsUrl,
    wasmUrl,
  })

  try {
    const result = await _keygen(params)
    tracker.trackOk({})

    return result
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
