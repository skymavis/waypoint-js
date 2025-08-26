export type ASAccessTokenPayload = {
  client_id?: string
}

export type WaypointTokenPayload = {
  iss?: "https://id.skymavis.com"
  sub?: string
  aud?: [string]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  sid?: string
  email?: string
  scp?: string
  roles?: [string]
}

export const addBearerPrefix = (waypointToken: string) => {
  return waypointToken.startsWith("Bearer ") ? waypointToken : "Bearer " + waypointToken
}
