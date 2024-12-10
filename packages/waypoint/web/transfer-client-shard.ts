import { CommunicateHelper, openPopup, replaceUrl } from "../common"
import { getScopesParams } from "../common/scope"
import { PopupAuthorizeData, PopupAuthorizeOpts, RedirectAuthorizeOpts } from "./auth"
import { RONIN_WAYPOINT_ORIGIN_PROD, TransferClientShardResponse } from "./common"
import {
  buildPrivateKey,
  decryptClientShard,
  generateKeyPair,
  KeyPair,
  stringifyKeyPair,
} from "./utils/generate-key"
import { getStorage, setStorage, STORAGE_KEYS_OF_TRANSFER_SHARD_KEY } from "./utils/storage"
import { validateIdAddress } from "./utils/validate-address"

export type TransferClientShardOpts = PopupAuthorizeOpts | RedirectAuthorizeOpts

export type PopupTransferClientShardData = {
  clientShard: string
} & PopupAuthorizeData

export type TransferClientShardData<T> = T extends PopupAuthorizeOpts
  ? PopupTransferClientShardData
  : undefined

export const transferClientShard = async <T extends TransferClientShardOpts>(
  opts: T,
): Promise<TransferClientShardData<T>> => {
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
    setStorage(STORAGE_KEYS_OF_TRANSFER_SHARD_KEY, JSON.stringify(stringifiedKeyPair))

    replaceUrl(`${waypointOrigin}/client/${clientId}/authorize`, {
      redirect: redirectUrl,
      state: opts.state ?? crypto.randomUUID(),
      scope: getScopesParams(scopes),
      publicKey: stringifiedKeyPair.publicKey,
    })
    return undefined as TransferClientShardData<T>
  }

  const helper = new CommunicateHelper(waypointOrigin)

  const authData = await helper.sendRequest<TransferClientShardResponse>(state =>
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
  } as TransferClientShardData<T>
}

export const parseTransferShardFromRedirectUrl = async () => {
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

  const keyPair = getStorage(STORAGE_KEYS_OF_TRANSFER_SHARD_KEY)

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
