import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorOpts,
  HeadlessBaseClientErrorType,
} from "./base"

export enum HeadlessCommonClientErrorCode {
  InvalidWaypointTokenError = -1100,
  InvalidClientShardError = -1101, //check
  UnsupportedTransactionTypeError = -1102,
  PrepareTransactionError = -1103,
  UnsupportedChainIdError = -1104,
  AddressIsNotMatch = -1105,
  ParseTypedDataError = -1106,
}

export const HeadlessCommonClientErrorName = "HeadlessCommonClientError"

export type HeadlessCommonClientErrorType<T = HeadlessCommonClientErrorCode> =
  HeadlessBaseClientErrorType<T, typeof HeadlessCommonClientErrorName>

export class HeadlessCommonClientError extends HeadlessBaseClientError<
  HeadlessCommonClientErrorCode,
  typeof HeadlessCommonClientErrorName | string
> {
  constructor(opts: HeadlessBaseClientErrorOpts<HeadlessCommonClientErrorCode>) {
    super({
      ...opts,
      name: HeadlessCommonClientErrorCode[opts.code] || HeadlessCommonClientErrorName,
    })
  }
}
