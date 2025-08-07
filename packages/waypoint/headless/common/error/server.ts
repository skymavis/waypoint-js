const ServerErrorName = "ServerError"

export enum ServerErrorCode {
  //-------------------------------- Server Error Common --------------------------------
  NotFound = 5,

  //-------------------------------- Server Error V1 --------------------------------
  OK = 0,
  Canceled = 1,
  Unknown = 2,
  InvalidArgument = 3,
  DeadlineExceeded = 4,
  AlreadyExists = 6,
  PermissionDenied = 7,
  ResourceExhausted = 8,
  FailedPrecondition = 9,
  Aborted = 10,
  OutOfRange = 11,
  Unimplemented = 12,
  Internal = 13,
  Unavailable = 14,
  DataLoss = 15,
  Unauthenticated = 16,
  NotSupported = 17,

  // Custom Error
  MPCInitializeProtocolFailed = 20,
  MPCHandshakeProtocolFailed = 21,
  MPCBadSignature = 22,
  MPCSignatureVerifyFailed = 23,
  MPCServerStoreKeyFailed = 24,
  MPCBadResult = 25,
  MPCSendTxRequestFailed = 26,
  MPCBadKey = 27,
  MPCSignMessageFailed = 28,
  MPCSendTxFailed = 29,
  MPCAddressAlreadyExisted = 30,
  MPCChallengeFailed = 31,
  MPCGetNonceFailed = 32,

  DialSocketFailed = 100,
  WriteDataFailed = 101,
  ReadDataFailed = 102,
  BadRPCData = 103,
  BadSignMessageData = 104,
  BadTxData = 105,
  InitHTTPFailed = 106,
  DoHTTPFailed = 107,
  BadHTTPData = 108,
  DialRPCNodeFailed = 109,
  HitRateLimitUUID = 110,
  InvalidNonce = 111,
  BadPayerSignature = 112,
  GetPayerSignatureFailed = 113,
  DecodePayerSignatureFailed = 114,
  InitSiweMessageFailed = 115,
  ParseSiweResourceFailed = 116,
  BadExpiredTime = 117,
  GetPayerAccessTokenFailed = 118,
  BadRPCURL = 119,
  TxNotSponsored = 120,
  TxSponsorNoAppLocalSponsorProgram = 121,
  TxSponsorExceedcap = 122,

  // Policy rules
  PolicyFailed = 1001,
  UserIDNotAllowed = 1002,
  PolicyMatchDenyList = 1003,
  DailyNativeTokenTransferredReachLimit = 1005,
  TxToAddressNotAllowed = 1006,
  TxValueReachedLimit = 1007,
}

export type ServerErrorOpts = {
  code: number
  message: string
}

export type ServerErrorType = ServerError & {
  name: string
}

export class ServerError extends Error {
  override name: string
  code: number

  constructor({ code, message }: ServerErrorOpts) {
    super(message)

    this.code = code
    this.name = ServerErrorCode[code] || ServerErrorName
  }
}
