import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorOpts,
  HeadlessBaseClientErrorType,
} from "./base"

export const HeadlessCommonClientErrorCode = {
  InvalidClientShardError: -1101,
  UnsupportedTransactionTypeError: -1102,
  PrepareTransactionError: -1103,
  UnsupportedChainIdError: -1104,
  AddressIsNotMatch: -1105,
  ParseTypedDataError: -1106,
  WaypointTokenNotFoundError: -1107,
  ClientShardNotFoundError: -1108,
  InvalidWaypointTokenError: -1109,

  InvalidSignatureError: -4404,
  UnknownError: -9900,
}

export type HeadlessCommonClientErrorType =
  (typeof HeadlessCommonClientErrorCode)[keyof typeof HeadlessCommonClientErrorCode]

export const HeadlessCommonClientErrorName = "HeadlessCommonClientError"

export type HeadlessCommonClientErrType<T = HeadlessCommonClientErrorType> =
  HeadlessBaseClientErrorType<T, typeof HeadlessCommonClientErrorName>

export class HeadlessCommonClientError extends HeadlessBaseClientError<
  HeadlessCommonClientErrorType,
  typeof HeadlessCommonClientErrorName | string
> {
  constructor(opts: HeadlessBaseClientErrorOpts<HeadlessCommonClientErrorType>) {
    super({
      ...opts,
      name:
        Object.keys(HeadlessCommonClientErrorCode).find(
          key =>
            HeadlessCommonClientErrorCode[key as keyof typeof HeadlessCommonClientErrorCode] ===
            opts.code,
        ) || HeadlessCommonClientErrorName,
    })
  }
}
