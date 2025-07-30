import {
  createBaseTracker,
  CreateBaseTrackerParams,
} from "../../headless-common-helper/track/track"
import { isPasswordlessProd } from "../../headless-common-helper/utils/service-url"

export enum HeadlessPasswordlessEventName {
  sendPaidTransaction = "passwordlessSendPaidTransaction",
  sendSponsoredTransaction = "passwordlessSendSponsoredTransaction",
  signTypedData = "passwordlessSignTypedData",
  personalSign = "passwordlessPersonalSign",
  genPasswordlessKey = "genPasswordlessKey",
  migrateFromPasswordWallet = "migrateFromPasswordWallet",
  genAsymmetricKey = "genAsymmetricKey",
  pullPasswordlessClientShard = "pullPasswordlessClientShard",
}

type ExtraCommonProperties = {
  wasm_version?: string
}

type CreatePasswordlessTrackerParams = Omit<
  CreateBaseTrackerParams<ExtraCommonProperties, HeadlessPasswordlessEventName>,
  "isProdEnv"
> & {
  passwordlessServiceUrl: string
  productionFactor: string | boolean
}

export const createPasswordlessTracker = (params: CreatePasswordlessTrackerParams) => {
  const { productionFactor, ...rest } = params
  const isProdEnv = isPasswordlessProd(productionFactor)

  return createBaseTracker({
    ...rest,
    isProdEnv,
  })
}
