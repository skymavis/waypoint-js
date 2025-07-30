import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorOpts,
  HeadlessBaseClientErrorType,
} from "../../headless-common-helper/error/base"
import { HeadlessCommonClientErrorCode } from "../../headless-common-helper/error/client"

export const HeadlessClientErrorCode = {
  // * common error
  ...HeadlessCommonClientErrorCode,

  // * socket error
  OpenSocketError: -2200,
  ListenSocketMessageError: -2201,
  // * when client do NOT process frame with type : DATA | DONE from socket
  MissingMessageError: -2202,

  // * wasm init error
  WebAssemblyNotSupportedError: -3300,
  InstantiateError: -3301,
  SetupGoWasmEnvError: -3302,
  CreateWasmInstanceError: -3303,
  // * wasm action error
  HandlerNotFoundError: -3304,
  WasmGetProtocolResultError: -3305,
  WasmReceiveSocketDataError: -3306,
  WasmTriggerSignError: -3307,
  WasmTriggerKeygenError: -3308,

  // * action error
  AuthenticateError: -4400,
  DecryptClientShardError: -4401,
  EncryptClientShardError: -4402,
  BackupClientShardError: -4403,

  SendTransactionError: -4405,
}

type HeadlessClientErrorCodeType =
  (typeof HeadlessClientErrorCode)[keyof typeof HeadlessClientErrorCode]

export const HeadlessClientErrorName = "HeadlessClientError"

type HeadlessClientErrorOpts = HeadlessBaseClientErrorOpts<
  HeadlessClientErrorCodeType,
  typeof HeadlessClientErrorName
>

export type HeadlessClientErrorType = HeadlessBaseClientErrorType<
  HeadlessClientErrorCodeType,
  typeof HeadlessClientErrorName
>

export class HeadlessClientError extends HeadlessBaseClientError<
  HeadlessClientErrorCodeType,
  typeof HeadlessClientErrorName | string
> {
  constructor(opts: HeadlessClientErrorOpts) {
    super({
      ...opts,
      name:
        Object.keys(HeadlessClientErrorCode).find(
          key => HeadlessClientErrorCode[key as keyof typeof HeadlessClientErrorCode] === opts.code,
        ) || HeadlessClientErrorName,
    })
  }
}
