import { Chain } from "viem"

import { CreateHeadlessCoreOpts, HeadlessCore } from "../v1"
import { CreateHeadlessPasswordlessCoreOpts, HeadlessPasswordlessCore } from "../v2"

export enum PreferMethod {
  RecoveryPassword = "recovery_password",
  Passwordless = "passwordless",
}

export type GetOmittedCoreOpts<T extends PreferMethod> = T extends PreferMethod.Passwordless
  ? Omit<CreateHeadlessPasswordlessCoreOpts, "chainId" | "overrideRpcUrl">
  : Omit<CreateHeadlessCoreOpts, "chainId" | "overrideRpcUrl">

export type CoreInstance<T extends PreferMethod> = T extends PreferMethod.Passwordless
  ? HeadlessPasswordlessCore
  : HeadlessCore

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
        } as CreateHeadlessPasswordlessCoreOpts

        return HeadlessPasswordlessCore.create(base) as CoreInstance<T>
      }
      case PreferMethod.RecoveryPassword: {
        const base = {
          ...coreOpts,
          chainId: chain.id,
          overrideRpcUrl: chain.rpcUrls.default.http[0],
        } as CreateHeadlessCoreOpts

        return HeadlessCore.create(base) as CoreInstance<T>
      }
      default:
        throw new Error(`Unsupported prefer method: ${preferMethod satisfies never}`)
    }
  }
}
