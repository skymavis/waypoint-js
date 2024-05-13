import { IEip1193EventEmitter } from "./eip1193-event"

export interface IEip1193RequestArgs {
  readonly method: string
  readonly params?: Array<any>
}

export interface IEip1193Provider extends IEip1193EventEmitter {
  request: <T = any>(args: IEip1193RequestArgs) => Promise<T>
}
