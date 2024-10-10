export type ConnectErrorCode =
  | -1 // unknown error
  | -100 // init lockbox client error
  | -200 // get backup client shard error
  | -300 // decrypt client shard error
  | -400 // get provider error

const errorNameMap: Record<ConnectErrorCode, string> = {
  [-1]: "UnknownError",
  [-100]: "InitLockboxClientError",
  [-200]: "GetBackupClientShardError",
  [-300]: "DecryptClientShardError",
  [-400]: "GetProviderError",
}

type ConnectErrorOpts = {
  code: ConnectErrorCode
  shortMessage: string
}

export type ConnectErrorType = ConnectError & { name: "ConnectError" }

export class ConnectError extends Error {
  override name = "ConnectError"
  code: ConnectErrorCode

  constructor(cause: unknown, { code, shortMessage }: ConnectErrorOpts) {
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
