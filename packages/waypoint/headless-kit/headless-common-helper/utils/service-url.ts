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

type PasswordlessServiceUrl = {
  httpUrl: string
}

export type PasswordlessServiceEnv = "prod" | "stag" | PasswordlessServiceUrl

// TODO: change to the prod url
const PASSWORDLESS_PROD_HTTP_URL = "https://growing-narwhal-infinitely.ngrok-free.app"

const PASSWORDLESS_STAG_HTTP_URL = " https://growing-narwhal-infinitely.ngrok-free.app"

export const getPasswordlessServiceUrls = (env: PasswordlessServiceEnv): PasswordlessServiceUrl => {
  switch (env) {
    case "prod":
      return {
        httpUrl: PASSWORDLESS_PROD_HTTP_URL,
      }
    case "stag":
      return {
        httpUrl: PASSWORDLESS_STAG_HTTP_URL,
      }
    default:
      return env
  }
}

export const isPasswordlessProd = (productionFactor: string | boolean): boolean => {
  if (typeof productionFactor === "boolean") {
    return productionFactor
  }

  return productionFactor === PASSWORDLESS_PROD_HTTP_URL
}
