export type Scope = "openid" | "profile" | "email" | "wallet"

export const getScopesParams = (scopes: Scope[] | undefined) =>
  scopes ? scopes.join(" ") : undefined

export const getDelegationScopesParams = (scopes: Scope[] | undefined) => {
  const initialScopes = scopes?.includes("wallet")
    ? scopes
    : ([...(scopes ?? []), "wallet"] as Scope[])
  return getScopesParams(initialScopes)
}
