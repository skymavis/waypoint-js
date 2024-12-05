type ErrorMeta = {
  requestId: string
  uuid: string
}

export type RawServerError = {
  code: number
  errorMessage: string
  meta: ErrorMeta | null
  serverErrorCode?: number
  closedReason?: string
}
