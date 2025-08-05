import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { createWasmInstance } from "../../wasm/create"

export const wasmGetKeygenHandler = async (wasmUrl: string) => {
  const instance = await createWasmInstance(wasmUrl)

  try {
    const keygenHandler = await instance.keygen()

    if (keygenHandler) {
      return keygenHandler
    }
  } catch (_) {
    /* empty */
  }

  throw new HeadlessClientError({
    cause: undefined,
    code: HeadlessClientErrorCode.HandlerNotFoundError,
    message: `Unable to get the keygen handler. This could be due to a wrong version of WASM with url="${wasmUrl}"`,
  })
}
