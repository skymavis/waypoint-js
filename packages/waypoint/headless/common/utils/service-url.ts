export type BaseServiceEnv<T extends object = object> = "prod" | "stag" | T

export type BaseServiceUrls<Extra extends object = object> = {
  httpUrl: string
} & Extra

export type GetBaseServiceUrl<Extra extends object = object> = (
  env: BaseServiceEnv<BaseServiceUrls<Extra>>,
) => BaseServiceUrls<Extra>

const LOCKBOX_PROD_HTTP_URL = "https://lockbox.skymavis.com"
const LOCKBOX_PROD_WS_URL = "wss://lockbox.skymavis.com"

const LOCKBOX_STAG_HTTP_URL = "https://project-x.skymavis.one"
const LOCKBOX_STAG_WS_URL = "wss://project-x.skymavis.one"

export type ServiceUrls = BaseServiceUrls<{
  wsUrl: string
}>

export type ServiceEnv = BaseServiceEnv<ServiceUrls>

export const getServiceUrls: GetBaseServiceUrl<{
  wsUrl: string
}> = env => {
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

// TODO: change to the prod url
const PASSWORDLESS_PROD_HTTP_URL = "https://growing-narwhal-infinitely.ngrok-free.app"

const PASSWORDLESS_STAG_HTTP_URL = "https://growing-narwhal-infinitely.ngrok-free.app"

export type PasswordlessServiceUrls = BaseServiceUrls

export type PasswordlessServiceEnv = BaseServiceEnv<PasswordlessServiceUrls>

export const getPasswordlessServiceUrls: GetBaseServiceUrl<PasswordlessServiceUrls> = env => {
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
