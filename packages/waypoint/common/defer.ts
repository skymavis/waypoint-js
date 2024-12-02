type Resolver<T> = (value: T | PromiseLike<T>) => void
type Rejector = (error?: unknown) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Deferred<T = any> {
  readonly promise: Promise<T>
  private _state: "unresolved" | "resolved" | "rejected" = "unresolved"

  private _resolve!: Resolver<T>
  private _reject!: Rejector

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  get state(): "unresolved" | "resolved" | "rejected" {
    return this._state
  }

  resolve = (value: T | PromiseLike<T>): void => {
    if (this._state === "unresolved") {
      this._state = "resolved"
      this._resolve(value)
    }
  }

  reject = (error?: unknown): void => {
    if (this._state === "unresolved") {
      this._state = "rejected"
      this._reject(error)
    }
  }
}
