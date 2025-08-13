import { HeadlessClientError, HeadlessClientErrorCode } from "../../common/error/client"
import { createWasmInstance } from "../wasm/create"

export const wasmGetSignHandler = async (wasmUrl: string) => {
  const instance = await createWasmInstance(wasmUrl)

  try {
    const signMessageHandler = await instance.signMessage()

    if (signMessageHandler) {
      return signMessageHandler
    }
  } catch (_) {
    /* empty */
  }

  throw new HeadlessClientError({
    cause: undefined,
    code: HeadlessClientErrorCode.HandlerNotFoundError,
    message: `Unable to get the sign handler. This could be due to a wrong version of WASM with url"${wasmUrl}"`,
  })
}
