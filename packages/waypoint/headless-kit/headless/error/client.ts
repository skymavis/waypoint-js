import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorOpts,
  HeadlessBaseClientErrorType,
} from "../../headless-common-helper/error/base"

export enum HeadlessClientErrorCode {
  // consider to move to headless-common

  // // * param error
  // InvalidWaypointTokenError = -1100,
  InvalidClientShardError = -1101,
  UnsupportedTransactionTypeError = -1102,
  PrepareTransactionError = -1103,
  UnsupportedChainIdError = -1104,
  AddressIsNotMatch = -1105,
  ParseTypedDataError = -1106,

  // * socket error
  OpenSocketError = -2200,
  ListenSocketMessageError = -2201,
  // * when client do NOT process frame with type = DATA | DONE from socket
  MissingMessageError = -2202,

  // * wasm init error
  WebAssemblyNotSupportedError = -3300,
  InstantiateError = -3301,
  SetupGoWasmEnvError = -3302,
  CreateWasmInstanceError = -3303,
  // * wasm action error
  HandlerNotFoundError = -3304,
  WasmGetProtocolResultError = -3305,
  WasmReceiveSocketDataError = -3306,
  WasmTriggerSignError = -3307,
  WasmTriggerKeygenError = -3308,

  // * action error
  AuthenticateError = -4400,
  DecryptClientShardError = -4401,
  EncryptClientShardError = -4402,
  BackupClientShardError = -4403,

  InvalidSignatureError = -4404,
  SendTransactionError = -4405,

  UnknownError = -9900,
}

export const HeadlessClientErrorName = "HeadlessClientError"

type HeadlessClientErrorOpts = HeadlessBaseClientErrorOpts<
  HeadlessClientErrorCode,
  typeof HeadlessClientErrorName
>

export type HeadlessClientErrorType = HeadlessBaseClientErrorType<
  HeadlessClientErrorCode,
  typeof HeadlessClientErrorName
>

export class HeadlessClientError extends HeadlessBaseClientError<
  HeadlessClientErrorCode,
  typeof HeadlessClientErrorName | string
> {
  constructor(opts: HeadlessClientErrorOpts) {
    super({
      ...opts,
      name: HeadlessClientErrorCode[opts.code] || HeadlessClientErrorName,
    })
  }
}
