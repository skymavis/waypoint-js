import {
  createBaseTracker,
  CreateBaseTrackerParams,
} from "../../headless-common-helper/track/track"
import { isProd } from "../../headless-common-helper/utils/service-url"

export enum HeadlessEventName {
  backupShard = "backupShard",
  decryptShard = "decryptShard",
  keygen = "keygen",
  personalSign = "personalSign",
  signTypedData = "signTypedData",
  sendLegacyTransaction = "sendLegacyTransaction",
  endEIP1559Transaction = "endEIP1559Transaction",
  sendSponsoredTransaction = "sendSponsoredTransaction",
}

type ExtraCommonProperties = {
  wasm_version?: string
}

type CreateTrackerParams = Omit<
  CreateBaseTrackerParams<ExtraCommonProperties, HeadlessEventName>,
  "isProdEnv"
> & {
  wasmUrl?: string
  productionFactor: string | boolean
}

export const createTracker = (params: CreateTrackerParams) => {
  const { productionFactor, ...rest } = params
  const isProdEnv = isProd(productionFactor)

  return createBaseTracker({
    ...rest,
    isProdEnv,
  })
}
