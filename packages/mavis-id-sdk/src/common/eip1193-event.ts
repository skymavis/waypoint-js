export enum EIP1193Event {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ACCOUNTS_CHANGED = "accountsChanged",
  CHAIN_CHANGED = "chainChanged",
}

interface IErrorEventAgrs extends Error {
  message: string
  code: number
  data?: unknown
}

interface IMessageEventArgs {
  type: string
  data: unknown
}

interface IConnectEventArgs {
  chainId: string
}

export interface IEip1193EventArgs {
  connect: IConnectEventArgs
  disconnect: IErrorEventAgrs
  message: IMessageEventArgs
  chainChanged: string
  accountsChanged: string[]
}

// define type for event emitter
export interface IEip1193EventEmitter {
  on: <E extends EIP1193Event>(event: E, listener: (args: IEip1193EventArgs[E]) => void) => void
  once: <E extends EIP1193Event>(event: E, listener: (args: IEip1193EventArgs[E]) => void) => void
  off: <E extends EIP1193Event>(event: E, listener: (args: IEip1193EventArgs[E]) => void) => void
  removeListener: <E extends EIP1193Event>(
    event: E,
    listener: (args: IEip1193EventArgs[E]) => void,
  ) => void
  emit: <E extends EIP1193Event>(event: E, payload: IEip1193EventArgs[E]) => boolean
}
