export type RawServerError = {
  error_code: number
  error_details: {
    reason: string
    server_error_code: number
  } | null
  error_message: string
}
