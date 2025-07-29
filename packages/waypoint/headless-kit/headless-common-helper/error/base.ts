// -------------------------------------------------------------
// Headless Base Client Error
// -------------------------------------------------------------
const HeadlessBaseClientErrorName = "HeadlessBaseClientError"

export type HeadlessBaseClientErrorOpts<T = unknown, N extends string = string> = {
  code: T
  message: string
  cause: unknown
  name?: N
}

export type HeadlessBaseClientErrorType<
  T = unknown,
  N extends string = string,
> = HeadlessBaseClientError<T, N> & {
  name: N
}

export class HeadlessBaseClientError<T, N extends string = string> extends Error {
  override name: N
  code: T
  shortMessage: string

  constructor({ code, message, cause, name }: HeadlessBaseClientErrorOpts<T, N>) {
    const fullMessage = ["", `code: ${code}`, `message: ${message}`].join("\n• ")

    super(fullMessage, cause ? { cause } : undefined)

    this.code = code
    this.name = name || (HeadlessBaseClientErrorName as N)
    this.shortMessage = message
  }
}

// -------------------------------------------------------------
// Server Base Error
// -------------------------------------------------------------

const ServerBaseErrorName = "ServerBaseError"

export type ServerBaseErrorOpts<N extends string = string> = {
  code: number
  message: string
  name?: N
}

export type ServerBaseErrorType<N extends string = string> = ServerBaseError<N> & {
  name: N
}

export class ServerBaseError<N extends string = string> extends Error {
  override name: N
  code: number
  shortMessage: string

  constructor({ code, message, name }: ServerBaseErrorOpts<N>) {
    const fullMessage = ["", `code: ${code}`, `message: ${message}`].join("\n• ")

    super(fullMessage)

    this.code = code
    this.name = name || (ServerBaseErrorName as N)
    this.shortMessage = message
  }
}
