const LOCKBOX_PROD_HTTP_URL = "https://lockbox.skymavis.com"
const LOCKBOX_PROD_WS_URL = "wss://lockbox.skymavis.com"

const LOCKBOX_STAG_HTTP_URL = "https://project-x.skymavis.one"
const LOCKBOX_STAG_WS_URL = "wss://project-x.skymavis.one"

export type ServiceUrls = {
  httpUrl: string
  wsUrl: string
}

export type ServiceEnv = "prod" | "stag" | ServiceUrls

export const getServiceUrls = (env: ServiceEnv): ServiceUrls => {
  switch (env) {
    case "prod":
      return {
        httpUrl: LOCKBOX_PROD_HTTP_URL,
        wsUrl: LOCKBOX_PROD_WS_URL,
      }
    case "stag":
      return {
        httpUrl: LOCKBOX_STAG_HTTP_URL,
        wsUrl: LOCKBOX_STAG_WS_URL,
      }
    default:
      return env
  }
}

export const isProd = (productionFactor: string | boolean): boolean => {
  if (typeof productionFactor === "boolean") {
    return productionFactor
  }

  return productionFactor === LOCKBOX_PROD_WS_URL || productionFactor === LOCKBOX_PROD_HTTP_URL
}
