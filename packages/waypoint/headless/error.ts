export type HeadlessClientErrorCode = -1 | -100 | -200 | -300 | -400 | -410 | -500 | -600 | -700

const errorNameMap: Record<HeadlessClientErrorCode, string> = {
  [-1]: "UnknownError",
  [-100]: "InitHeadlessClientError",
  [-200]: "GetBackupClientShardError",
  [-300]: "DecryptClientShardError",
  [-400]: "InvalidWaypointTokenError",
  [-410]: "InvalidClientShardError",
  [-500]: "GetLockboxProviderError",
  [-600]: "KeylessValidationError",
  [-700]: "ClientIsNotConnectedError",
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
