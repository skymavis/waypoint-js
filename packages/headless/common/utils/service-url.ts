export type ServiceEnv = "prod" | "stag"

const LOCKBOX_PROD_HTTP_URL = "https://lockbox.skymavis.com"
const LOCKBOX_PROD_WS_URL = "wss://lockbox.skymavis.com"

const LOCKBOX_STAG_HTTP_URL = "https://project-x.skymavis.one"
const LOCKBOX_STAG_WS_URL = "wss://project-x.skymavis.one"

export type HeadlessV1ServiceUrls = {
  httpUrl: string
  wsUrl: string
}

export type HeadlessV1ServiceEnv = ServiceEnv | HeadlessV1ServiceUrls

export const getHeadlessV1ServiceUrls = (env: HeadlessV1ServiceEnv): HeadlessV1ServiceUrls => {
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

export const isHeadlessV1Prod = (productionFactor: string): boolean => {
  return productionFactor === LOCKBOX_PROD_WS_URL || productionFactor === LOCKBOX_PROD_HTTP_URL
}

// TODO: change to the prod url
const HEADLESS_V2_PROD_HTTP_URL = "https://headless-v2.skymavis.com"

const HEADLESS_V2_STAG_HTTP_URL = "https://growing-narwhal-infinitely.ngrok-free.app"

export type HeadlessV2ServiceUrls = {
  httpUrl: string
}

export type HeadlessV2ServiceEnv = ServiceEnv | HeadlessV2ServiceUrls

export const getHeadlessV2ServiceUrls = (env: HeadlessV2ServiceEnv): HeadlessV2ServiceUrls => {
  switch (env) {
    case "prod":
      return {
        httpUrl: HEADLESS_V2_PROD_HTTP_URL,
      }
    case "stag":
      return {
        httpUrl: HEADLESS_V2_STAG_HTTP_URL,
      }
    default:
      return env
  }
}

export const isHeadlessV2Prod = (productionFactor: string): boolean => {
  return productionFactor === HEADLESS_V2_PROD_HTTP_URL
}
