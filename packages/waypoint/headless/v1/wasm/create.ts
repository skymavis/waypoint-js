import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { injectSkymavisMpc } from "./instantiate"
import { SkyMavisMpc } from "./types"

let currentInstance: SkyMavisMpc | undefined
let currentUrl: string

export const createWasmInstance = async (url: string) => {
  const cached = currentInstance !== undefined
  const sameUrl = currentUrl === url

  if (cached && sameUrl) {
    return currentInstance as SkyMavisMpc
  }

  await injectSkymavisMpc(url)

  if (globalThis.skymavismpc) {
    currentInstance = globalThis.skymavismpc
    currentUrl = url

    return currentInstance as SkyMavisMpc
  }

  throw new HeadlessClientError({
    code: HeadlessClientErrorCode.CreateWasmInstanceError,
    message: `Unable to create WASM instance. The variable "globalThis.skymavismpc" is undefined.`,
    cause: undefined,
  })
}
