export type GetKeylessProviderErrorCode =
  | -1 // unknown error
  | -100 // init lockbox client error
  | -200 // get backup client shard error
  | -300 // decrypt client shard error
  | -400 // get provider error

const errorNameMap: Record<GetKeylessProviderErrorCode, string> = {
  [-1]: "UnknownError",
  [-100]: "InitLockboxClientError",
  [-200]: "GetBackupClientShardError",
  [-300]: "DecryptClientShardError",
  [-400]: "GetProviderError",
}

type GetKeylessProviderErrorOpts = {
  code: GetKeylessProviderErrorCode
  shortMessage: string
}

export type GetKeylessProviderErrorType = GetKeylessProviderError & {
  name: "GetKeylessProviderError"
}

export class GetKeylessProviderError extends Error {
  override name = "GetKeylessProviderError"
  code: GetKeylessProviderErrorCode

  constructor(cause: unknown, { code, shortMessage }: GetKeylessProviderErrorOpts) {
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
