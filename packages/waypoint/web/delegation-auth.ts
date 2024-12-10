import { CommunicateHelper, openPopup, replaceUrl } from "../common"
import { getDelegationScopesParams, getScopesParams } from "../common/scope"
import {
  parseRedirectUrl as parseRedirectUrlForAuthData,
  PopupAuthorizeData,
  PopupAuthorizeOpts,
  RedirectAuthorizeOpts,
} from "./auth"
import { DelegationAuthorizeResponse, RONIN_WAYPOINT_ORIGIN_PROD } from "./common"
import {
  buildPrivateKey,
  decryptClientShard,
  generateKeyPair,
  KeyPair,
  stringifyKeyPair,
} from "./utils/key-helper"
import { getStorage, setStorage, STORAGE_SHARD_TRANSFER_KEY } from "./utils/storage"
import { validateIdAddress } from "./utils/validate-address"

export type DelegationAuthorizeOpts = PopupAuthorizeOpts | RedirectAuthorizeOpts

export type PopupDelegationAuthorizeData = {
  clientShard: string
} & PopupAuthorizeData

export type DelegationAuthorizeData<T> = T extends PopupAuthorizeOpts
  ? PopupDelegationAuthorizeData
  : undefined

export const delegationAuthorize = async <T extends DelegationAuthorizeOpts>(
  opts: T,
): Promise<DelegationAuthorizeData<T>> => {
  const {
    mode,
    clientId,
    scopes,
    waypointOrigin = RONIN_WAYPOINT_ORIGIN_PROD,
    redirectUrl = window.location.origin,
  } = opts

  const keyPair = await generateKeyPair()
  const stringifiedKeyPair = await stringifyKeyPair(keyPair)

  if (mode === "redirect") {
    setStorage(STORAGE_SHARD_TRANSFER_KEY, JSON.stringify(stringifiedKeyPair))

    replaceUrl(`${waypointOrigin}/client/${clientId}/authorize`, {
      redirect: redirectUrl,
      state: opts.state ?? crypto.randomUUID(),
      scope: getDelegationScopesParams(scopes),
      publicKey: stringifiedKeyPair.publicKey,
    })
    return undefined as DelegationAuthorizeData<T>
  }

  const helper = new CommunicateHelper(waypointOrigin)

  const authData = await helper.sendRequest<DelegationAuthorizeResponse>(state =>
    openPopup(`${waypointOrigin}/client/${clientId}/authorize`, {
      state,
      redirect: redirectUrl,
      origin: window.location.origin,
      scope: getScopesParams(scopes),
      publicKey: stringifiedKeyPair.publicKey,
    }),
  )

  const {
    id_token: token,
    address: rawAddress,
    secondary_address: secondaryAddress,
    wallet_key: encryptedShard,
  } = authData ?? {}

  const clientShard = await decryptClientShard(encryptedShard, keyPair.privateKey)

  return {
    token,
    address: validateIdAddress(rawAddress),
    secondaryAddress: validateIdAddress(secondaryAddress),
    clientShard,
  } as DelegationAuthorizeData<T>
}

const parseClientShard = async () => {
  const url = new URL(window.location.href)

  const method = url.searchParams.get("method")
  if (method !== "auth") {
    throw "parseRedirectUrl: invalid method"
  }

  const type = url.searchParams.get("type")
  if (type !== "success") {
    throw "parseRedirectUrl: authorization failed"
  }

  const encryptedShard = url.searchParams.get("wallet_key")

  if (!encryptedShard) {
    throw "parseRedirectUrl: encrypted shard not found"
  }

  const keyPair = getStorage(STORAGE_SHARD_TRANSFER_KEY)

  if (!keyPair) {
    throw "parseRedirectUrl: client shard key pair not found"
  }

  const privateKey = (JSON.parse(keyPair) as KeyPair).privateKey
  const builtPrivateKey = await buildPrivateKey(privateKey)
  const clientShard = await decryptClientShard(encryptedShard, builtPrivateKey)

  return {
    clientShard,
  }
}

export const parseRedirectUrlWithShard = async () => {
  const authData = parseRedirectUrlForAuthData()
  const { clientShard } = await parseClientShard()
  return {
    ...authData,
    clientShard,
  }
}
