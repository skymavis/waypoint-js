import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { base64ToHex, bytesToBase64, bytesToJson } from "../../utils/convertor"
import { type ActionHandler, type SignHandlerDoResult } from "../../wasm/types"

// * trigger signing process in wasm
export const wasmTriggerSign = async (
  signHandler: ActionHandler,
  keccakMessage: Uint8Array,
  clientShard: string,
) => {
  try {
    const wasmSignParams = {
      key: clientShard,
      signMessage: bytesToBase64(keccakMessage),
    }
    const doResponse = await signHandler.do(JSON.stringify(wasmSignParams))
    const result = bytesToJson(doResponse) as SignHandlerDoResult

    if (result?.data?.signature) {
      return base64ToHex(result.data.signature)
    }
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.WasmTriggerSignError,
      message: `Unable to trigger the WASM signing process.`,
    })
  }

  throw new HeadlessClientError({
    cause: undefined,
    code: HeadlessClientErrorCode.WasmTriggerSignError,
    message: `Unable to get signature from WASM sign handler.`,
  })
}
