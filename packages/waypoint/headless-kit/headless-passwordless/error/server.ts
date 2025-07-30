import {
  ServerBaseError,
  ServerBaseErrorOpts,
  ServerBaseErrorType,
} from "../../headless-common-helper/error/base"

export enum ServerErrorCode {}

const ServerErrorName = "PasswordlessServerError"

export type ServerErrorType = ServerBaseErrorType<typeof ServerErrorName>

export class ServerError extends ServerBaseError<typeof ServerErrorName> {
  constructor(opts: ServerBaseErrorOpts<typeof ServerErrorName>) {
    super(opts)
  }
}
