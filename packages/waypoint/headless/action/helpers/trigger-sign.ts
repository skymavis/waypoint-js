import { bytesToHex, type Hex, isHex, keccak256 } from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { base64ToHex, bytesToBase64, bytesToJson } from "../../utils/convertor"
import { type ActionHandler, type SignHandlerDoResult } from "../../wasm/types"

// * trigger signing process in wasm
export const wasmTriggerSign = async (
  signHandler: ActionHandler,
  message: Uint8Array | Hex,
  clientShard: string,
) => {
  const createError = (cause: unknown) => {
    const hexMessage = isHex(message) ? message : bytesToHex(message)

    return new HeadlessClientError({
      cause,
      code: HeadlessClientErrorCode.WasmTriggerSignError,
      message: `Unable to trigger the WASM signing process with the hex message "${hexMessage}".`,
    })
  }

  try {
    const wasmSignParams = {
      key: clientShard,
      signMessage: bytesToBase64(keccak256(message, "bytes")),
    }
    const doResponse = await signHandler.do(JSON.stringify(wasmSignParams))
    const result = bytesToJson(doResponse) as SignHandlerDoResult

    if (result?.data?.signature) {
      return base64ToHex(result.data.signature)
    }
  } catch (error) {
    throw createError(error)
  }

  throw createError(undefined)
}

export const wasmTriggerSignSponsor = async (
  signHandler: ActionHandler,
  message: Uint8Array,
  clientShard: string,
) => {
  const createError = (cause: unknown) => {
    const hexMessage = isHex(message) ? message : bytesToHex(message)

    return new HeadlessClientError({
      cause,
      code: HeadlessClientErrorCode.WasmTriggerSignError,
      message: `Unable to trigger the WASM signing process with the hex message "${hexMessage}".`,
    })
  }

  try {
    const wasmSignParams = {
      key: clientShard,
      signMessage: bytesToBase64(message),
    }
    const doResponse = await signHandler.do(JSON.stringify(wasmSignParams))
    const result = bytesToJson(doResponse) as SignHandlerDoResult

    if (result?.data?.signature) {
      return base64ToHex(result.data.signature)
    }
  } catch (error) {
    throw createError(error)
  }

  throw createError(undefined)
}
