import { Chain } from "viem"

import { CreateHeadlessV1CoreOpts, HeadlessV1Core } from "../v1"
import { CreateHeadlessV2CoreOpts, HeadlessV2Core } from "../v2"
import { HeadlessClientError, HeadlessClientErrorCode } from "./error/client"

export enum PreferMethod {
  RecoveryPassword = "recovery_password",
  Passwordless = "passwordless",
}

export type GetOmittedCoreOpts<T extends PreferMethod> = T extends PreferMethod.Passwordless
  ? Omit<CreateHeadlessV2CoreOpts, "chainId" | "overrideRpcUrl">
  : Omit<CreateHeadlessV1CoreOpts, "chainId" | "overrideRpcUrl">

export type CoreInstance<T extends PreferMethod> = T extends PreferMethod.Passwordless
  ? HeadlessV2Core
  : HeadlessV1Core

export type HeadlessCoreFactoryOptions<T extends PreferMethod> = GetOmittedCoreOpts<T> & {
  chain: Chain
  preferMethod: T
}

export class HeadlessCoreFactory {
  static create<T extends PreferMethod>(opts: HeadlessCoreFactoryOptions<T>): CoreInstance<T> {
    const { chain, preferMethod, ...coreOpts } = opts

    switch (preferMethod) {
      case PreferMethod.Passwordless: {
        const base = {
          ...coreOpts,
          chainId: chain.id,
          overrideRpcUrl: chain.rpcUrls.default.http[0],
        } as CreateHeadlessV2CoreOpts

        return new HeadlessV2Core(base) as CoreInstance<T>
      }
      case PreferMethod.RecoveryPassword: {
        const base = {
          ...coreOpts,
          chainId: chain.id,
          overrideRpcUrl: chain.rpcUrls.default.http[0],
        } as CreateHeadlessV1CoreOpts

        return new HeadlessV1Core(base) as CoreInstance<T>
      }
      default:
        throw new HeadlessClientError({
          cause: undefined,
          code: HeadlessClientErrorCode.UnsupportedMethod,
          message: `Unsupported prefer method: ${preferMethod}. Use one of the following: ${Object.values(PreferMethod).join(", ")}`,
        })
    }
  }
}
