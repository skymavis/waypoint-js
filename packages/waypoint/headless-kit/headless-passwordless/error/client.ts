import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorOpts,
  HeadlessBaseClientErrorType,
} from "../../headless-common-helper/error/base"

export enum HeadlessPasswordlessClientErrorCode {
  //Todo: update to common error code

  InvalidClientShardError = -1101,
  UnsupportedTransactionTypeError = -1102,
  PrepareTransactionError = -1103,
  UnsupportedChainIdError = -1104,
  AddressIsNotMatch = -1105,
  ParseTypedDataError = -1106,
  WaypointTokenNotFoundError = -1107,
  ClientShardNotFoundError = -1108,
  UnknownError = -1109,

  InvalidSignatureError = -4404,
}

const HeadlessPasswordlessClientErrorName = "HeadlessPasswordlessClientError"

export type HeadlessPasswordlessClientErrorOpts = HeadlessBaseClientErrorOpts<
  HeadlessPasswordlessClientErrorCode,
  typeof HeadlessPasswordlessClientErrorName
>

export type HeadlessPasswordlessClientErrorType = HeadlessBaseClientErrorType<
  HeadlessPasswordlessClientErrorCode,
  typeof HeadlessPasswordlessClientErrorName
>

export class HeadlessPasswordlessClientError extends HeadlessBaseClientError<
  HeadlessPasswordlessClientErrorCode,
  typeof HeadlessPasswordlessClientErrorName | string
> {
  constructor(opts: HeadlessPasswordlessClientErrorOpts) {
    super({
      ...opts,
      name: opts.name || HeadlessPasswordlessClientErrorName,
    })
  }
}
