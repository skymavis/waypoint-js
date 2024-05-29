type Resolver<T> = (value: T | PromiseLike<T>) => void

type Rejector = (error?: unknown) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Deferred<T = any> {
  state: "resolved" | "rejected" | "unresolved" = "unresolved"

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resolve: Resolver<T> = () => {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reject: Rejector = () => {}

  protected setState(state: "resolved" | "rejected"): void {
    if (this.state === "unresolved") this.state = state
  }

  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve
    this.reject = reject
  }).then(
    res => (this.setState("resolved"), res),
    err => (this.setState("rejected"), Promise.reject(err)),
  )
}
