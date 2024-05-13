export type RawProfile = {
  iss: string
  sub: string
  aud: string[]
  exp: number
  nbf: number
  iat: number
  jti: string
  email: string
  name: string
  avatar_url: string
  scp: string
}

export type Profile = Pick<RawProfile, "sub" | "email" | "name" | "avatar_url"> & {
  mpcAddress: string
}
