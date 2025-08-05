import { createBaseTracker, CreateBaseTrackerParams } from "../../common/track/track"
import { isPasswordlessProd } from "../../common/utils/service-url"

export enum HeadlessPasswordlessEventName {
  sendPaidTransaction = "passwordlessSendPaidTransaction",
  sendSponsoredTransaction = "passwordlessSendSponsoredTransaction",
  signTypedData = "passwordlessSignTypedData",
  personalSign = "passwordlessPersonalSign",
  genPasswordlessKey = "genPasswordlessKey",
  migrateFromPasswordWallet = "migrateFromPasswordWallet",
  genExchangeAsymmetricKey = "genExchangeAsymmetricKey",
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
