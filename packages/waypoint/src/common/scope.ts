export type Scope = "openid" | "profile" | "email" | "wallet"

export const getScopesParams = (scopes: Scope[] | undefined) =>
  scopes ? scopes.join(" ") : undefined
