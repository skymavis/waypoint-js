import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { setupGoWasmEnv } from "./wasm-exec"

const wasmBrowserInstantiate = async (wasmModuleUrl: string, importObject: WebAssembly.Imports) => {
  if (!WebAssembly) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.WebAssemblyNotSupportedError,
      message: `WebAssembly not supported on this environment. The variable "WebAssembly" is undefined.`,
      cause: undefined,
    })
  }

  try {
    if (WebAssembly.instantiateStreaming) {
      const wasmFetcher = fetch(wasmModuleUrl)

      // Fetch the module, and instantiate it as it is downloading
      const newInstance = await WebAssembly.instantiateStreaming(wasmFetcher, importObject)
      return newInstance
    }

    // Fallback to using fetch to download the entire module
    // And then instantiate the module
    const wasmResponse = await fetch(wasmModuleUrl)
    const wasmArrayBuffer = await wasmResponse.arrayBuffer()

    return await WebAssembly.instantiate(wasmArrayBuffer, importObject)
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.InstantiateError,
      message: `Unable to instantiate WASM module with url="${wasmModuleUrl}".`,
      cause: error,
    })
  }
}

export const injectSkymavisMpc = async (wasmModuleUrl: string) => {
  if (!globalThis.Go) {
    try {
      setupGoWasmEnv()
    } catch (error) {
      throw new HeadlessClientError({
        code: HeadlessClientErrorCode.SetupGoWasmEnvError,
        message: "Unable to setup Go WASM environment.",
        cause: error,
      })
    }
  }

  if (!globalThis.Go) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SetupGoWasmEnvError,
      message: `Unable to setup Go WASM environment. The variable "globalThis.Go" is undefined.`,
      cause: undefined,
    })
  }

  const go = new globalThis.Go()
  const wasmSource = await wasmBrowserInstantiate(wasmModuleUrl, go.importObject)

  try {
    go.run(wasmSource.instance)
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SetupGoWasmEnvError,
      message: "Unable to execute WASM module by Go WASM environment.",
      cause: error,
    })
  }
}
