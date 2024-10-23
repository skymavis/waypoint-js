export type HeadlessClientErrorCode =
  | -1 // unknown error
  | -100 // init lockbox error
  | -200 // get backup client shard error
  | -300 // decrypt client shard error
  | -310 // client shard is not valid
  | -400 // waypoint token is not valid
  | -500 // get provider error
  | -600 // could not sign message

const errorNameMap: Record<HeadlessClientErrorCode, string> = {
  [-1]: "UnknownError",
  [-100]: "InitLockboxError",
  [-200]: "GetBackupClientShardError",
  [-300]: "DecryptClientShardError",
  [-310]: "ClientShardIsNotValid",
  [-400]: "WaypointTokenIsNotValid",
  [-500]: "GetProviderError",
  [-600]: "CouldNotSignMessage",
}

type HeadlessClientErrorOpts = {
  code: HeadlessClientErrorCode
  shortMessage: string
}

export type HeadlessClientErrorType = HeadlessClientError & {
  name: "HeadlessClientError"
}

export class HeadlessClientError extends Error {
  override name = "HeadlessClientError"
  code: HeadlessClientErrorCode

  constructor(cause: unknown, { code, shortMessage }: HeadlessClientErrorOpts) {
    super(shortMessage, {
      cause,
    })

    this.name = errorNameMap[code] ?? toErrorName(cause)
    this.code = code
  }
}

const toErrorName = (error: unknown) => {
  if (error instanceof Error) return error.name

  return String(error)
}
