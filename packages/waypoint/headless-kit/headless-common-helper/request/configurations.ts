import type { RequestHeaders, RequestMethod } from "./types"

export const requestTimeoutInMs = 15_000
export const allowedMethods: RequestMethod[] = ["get", "post", "put", "patch", "delete"]
export const allowedHeaders: (keyof RequestHeaders)[] = ["contentType", "authorization"]
