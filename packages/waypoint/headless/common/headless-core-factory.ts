import { Chain } from "viem"

import { CreateHeadlessCoreOpts, HeadlessCore } from "../v1"
import { CreateHeadlessPasswordlessCoreOpts, HeadlessPasswordlessCore } from "../v2"

export enum PreferMethod {
  PASSWORDLESS = "passwordless",
  RECOVERY_PASSWORD = "recovery_password",
}
type GetCoreOpts<T extends PreferMethod> = T extends PreferMethod.PASSWORDLESS
  ? CreateHeadlessPasswordlessCoreOpts
  : CreateHeadlessCoreOpts

type CoreInstance<T extends PreferMethod> = T extends PreferMethod.PASSWORDLESS
  ? HeadlessPasswordlessCore
  : HeadlessCore

type HeadlessCoreFactoryOptions<T extends PreferMethod> = Omit<
  GetCoreOpts<T>,
  "chainId" | "overrideRpcUrl"
> & {
  chain: Chain
  preferMethod: T
}

export class HeadlessCoreFactory {
  static create<T extends PreferMethod>(opts: HeadlessCoreFactoryOptions<T>): CoreInstance<T> {
    const { chain, preferMethod, ...coreOpts } = opts

    switch (preferMethod) {
      case PreferMethod.PASSWORDLESS: {
        const base = {
          ...coreOpts,
          chainId: chain.id,
          overrideRpcUrl: chain.rpcUrls.default.http[0],
        } as CreateHeadlessPasswordlessCoreOpts

        return HeadlessPasswordlessCore.create(base) as CoreInstance<T>
      }
      case PreferMethod.RECOVERY_PASSWORD: {
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
