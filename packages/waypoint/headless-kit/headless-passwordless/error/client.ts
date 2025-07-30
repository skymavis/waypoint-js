import {
  HeadlessBaseClientError,
  HeadlessBaseClientErrorOpts,
  HeadlessBaseClientErrorType,
} from "../../headless-common-helper/error/base"
import { HeadlessCommonClientErrorCode } from "../../headless-common-helper/error/client"

export const HeadlessPasswordlessClientErrorCode = {
  ...HeadlessCommonClientErrorCode,
}

export type HeadlessPasswordlessClientErrorCodeType =
  (typeof HeadlessPasswordlessClientErrorCode)[keyof typeof HeadlessPasswordlessClientErrorCode]

export const HeadlessPasswordlessClientErrorName = "HeadlessPasswordlessClientError"

export type HeadlessPasswordlessClientErrorOpts = HeadlessBaseClientErrorOpts<
  HeadlessPasswordlessClientErrorCodeType,
  typeof HeadlessPasswordlessClientErrorName
>

export type HeadlessPasswordlessClientErrorType = HeadlessBaseClientErrorType<
  HeadlessPasswordlessClientErrorCodeType,
  typeof HeadlessPasswordlessClientErrorName
>

export class HeadlessPasswordlessClientError extends HeadlessBaseClientError<
  HeadlessPasswordlessClientErrorCodeType,
  typeof HeadlessPasswordlessClientErrorName | string
> {
  constructor(opts: HeadlessPasswordlessClientErrorOpts) {
    super({
      ...opts,
      name:
        Object.keys(HeadlessPasswordlessClientErrorCode).find(
          key =>
            HeadlessPasswordlessClientErrorCode[
              key as keyof typeof HeadlessPasswordlessClientErrorCode
            ] === opts.code,
        ) || HeadlessPasswordlessClientErrorName,
    })
  }
}
