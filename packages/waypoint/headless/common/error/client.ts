const HeadlessClientErrorName = "HeadlessClientError"

export enum HeadlessClientErrorCode {
  //-------------------------------- Headless Common Error --------------------------------
  UnsupportedMethod = -1000,
  InvalidClientShardError = -1101,
  UnsupportedTransactionTypeError = -1102,
  PrepareTransactionError = -1103,
  UnsupportedChainIdError = -1104,
  AddressIsNotMatch = -1105,
  ParseTypedDataError = -1106,
  WaypointTokenNotFoundError = -1107,
  ClientShardNotFoundError = -1108,
  InvalidWaypointTokenError = -1109,

  InvalidSignatureError = -4404,
  UnknownError = -9900,

  //-------------------------------- Headless V1 Error --------------------------------
  // * socket error
  OpenSocketError = -2200,
  ListenSocketMessageError = -2201,
  // * when client do NOT process frame with type  = DATA | DONE from socket
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
  SendTransactionError = -4405,
}

export type HeadlessClientErrorOpts = {
  code: number
  message: string
  cause: unknown
}

export type HeadlessClientErrorType = HeadlessClientError & {
  name: string
}

export class HeadlessClientError extends Error {
  override name: string
  code: number

  constructor({ code, message, cause }: HeadlessClientErrorOpts) {
    super(message, cause ? { cause } : undefined)

    this.code = code
    this.name = HeadlessClientErrorCode[code] || HeadlessClientErrorName
  }
}
