/* eslint-disable no-var */
import { GoWasm, SkyMavisMpc } from "./wasm/types"

export declare global {
  var Go: typeof GoWasm
  var skymavismpc: SkyMavisMpc | undefined
}
