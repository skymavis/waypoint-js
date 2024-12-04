export enum HeadlessClientErrorCode {
  // * old error
  // TODO: refactor
  UnknownError = -1,
  InitHeadlessClientError = -100,
  GetBackupClientShardError = -200,
  InvalidWaypointTokenError = -400,

  GetLockboxProviderError = -500,
  KeylessValidationError = -600,
  ClientIsNotConnectedError = -700,

  // param error
  InvalidClientShardError = -11100,

  // socket error
  OpenSocketError = -22200,
  ListenSocketMessageError = -22201,

  SocketAuthenticateError = -22202,
  SocketSendError = -22203,

  // * when client do NOT process frame with type = DATA | DONE from socket
  MissingMessageError = -22204,

  // wasm common error
  WebAssemblyNotSupportedError = -33300,
  InstantiateError = -33301,
  SetupGoWasmEnvError = -33302,
  CreateWasmInstanceError = -33303,

  // wasm action error
  HandlerNotFoundError = -33304,
  WasmGetProtocolResultError = -33305,
  WasmReceiveSocketDataError = -33306,
  WasmTriggerSignError = -33307,
  WasmTriggerKeygenError = -33308,

  // action error
  InvalidSignatureError = -44400,

  DecryptClientShardError = -44401,
  EncryptClientShardError = -44402,
  BackupClientShardError = -44403,

  SendTransactionError = -44404,
}

type HeadlessClientErrorOpts = {
  code: HeadlessClientErrorCode
  message: string
  cause: unknown
}

export type HeadlessClientErrorType = HeadlessClientError & {
  name: "HeadlessClientError"
}

export class HeadlessClientError extends Error {
  override name = "HeadlessClientError"
  code: HeadlessClientErrorCode

  constructor({ code, message, cause }: HeadlessClientErrorOpts) {
    super(message, cause ? { cause } : undefined)

    this.code = code
    this.name = HeadlessClientErrorCode[code]
  }
}
