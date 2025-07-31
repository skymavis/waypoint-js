import { CreateHeadlessClientOpts, HeadlessClient } from "../headless/client/client"
import {
  CreateHeadlessPasswordlessClientOpts,
  HeadlessPasswordlessClient,
} from "../headless-passwordless"

export enum PreferMethod {
  PASSWORDLESS = "passwordless",
  RECOVERY_PASSWORD = "recovery_password",
}

export type CreateHeadlessKitAdapterOpts<T extends PreferMethod = PreferMethod.RECOVERY_PASSWORD> =
  {
    mode?: T
    [PreferMethod.PASSWORDLESS]: CreateHeadlessPasswordlessClientOpts
    [PreferMethod.RECOVERY_PASSWORD]: CreateHeadlessClientOpts
  }

type CoreType<T extends PreferMethod> = T extends PreferMethod.PASSWORDLESS
  ? HeadlessPasswordlessClient
  : HeadlessClient

type CoreInstanceRecord = {
  [K in PreferMethod]: K extends PreferMethod.PASSWORDLESS
    ? HeadlessPasswordlessClient
    : HeadlessClient
}

export class HeadlessKitAdapter<T extends PreferMethod = PreferMethod.RECOVERY_PASSWORD> {
  private preferMethod: T = PreferMethod.RECOVERY_PASSWORD as T
  private coreInstanceRecords: CoreInstanceRecord

  protected constructor(opts: CreateHeadlessKitAdapterOpts<T>) {
    if (opts.mode) {
      this.preferMethod = opts.mode
    }

    this.coreInstanceRecords = {
      [PreferMethod.PASSWORDLESS]: HeadlessPasswordlessClient.create(
        opts[PreferMethod.PASSWORDLESS],
      ),
      [PreferMethod.RECOVERY_PASSWORD]: HeadlessClient.create(opts[PreferMethod.RECOVERY_PASSWORD]),
    }

    this.getCurrentCoreInstance()
  }

  static create<T extends PreferMethod>(
    opts: CreateHeadlessKitAdapterOpts<T>,
  ): HeadlessKitAdapter<T> {
    return new HeadlessKitAdapter(opts)
  }

  getPreferMethod(): T {
    return this.preferMethod
  }

  setPreferMethod(preferMethod: T) {
    this.preferMethod = preferMethod
  }

  getCoreInstanceByPreferMethod<K extends PreferMethod>(preferMethod: K): CoreType<K> {
    return this.coreInstanceRecords[preferMethod] as CoreType<K>
  }

  getCurrentCoreInstance(): CoreType<T> {
    return this.coreInstanceRecords[this.preferMethod] as CoreType<T>
  }

  getProvider() {
    return this.coreInstanceRecords[this.preferMethod].getProvider()
  }
}
