export declare class GoWasm {
  constructor()
  importObject: WebAssembly.Imports
  run(instance: WebAssembly.Instance): void
}

export type SkyMavisMpc = {
  signMessage: () => ActionHandler
  keygen: () => ActionHandler
}

export type ActionHandler = {
  do: (agrs: string) => Promise<Uint8Array>
  isConnClosed: () => boolean
  rx: () => Promise<Uint8Array>
  tx: (args: Uint8Array) => void
}

type Kind = "authenticate" | "mpc_protocol" | "error" | "done"

export type HandlerRxResult = {
  kind: Kind
  // * in base64 format
  data: string
}

export type HandlerTxParams = {
  kind: Kind
  // * in base64 format
  data: unknown
}

export type SignHandlerDoResult = {
  data: {
    signature: string
  }
}

export interface KeygenHandlerDoResponse {
  data: {
    key: string
  }
}
