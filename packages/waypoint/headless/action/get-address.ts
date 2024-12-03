import { secp256k1 } from "@noble/curves/secp256k1"
import { Hex } from "viem"
import { type Address, publicKeyToAddress } from "viem/accounts"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { base64ToBytes, bytesToJson } from "../utils/convertor"

type ClientShard = {
  chainKey: string
  secretShare: string
  publicPoint: string
  appID: string
}

export const getAddressFromShard = (clientShard: string): Address => {
  try {
    const shardInBytes = base64ToBytes(clientShard)
    const shard = bytesToJson(shardInBytes) as ClientShard

    const { publicPoint: compressedPublicKeyInBase64 } = shard
    const compressedPublicKeyInBytes = base64ToBytes(compressedPublicKeyInBase64)

    const projPoint = secp256k1.ProjectivePoint.fromHex(compressedPublicKeyInBytes)
    const uncompressedPublicKey: Hex = `0x${projPoint.toHex(false)}`

    return publicKeyToAddress(uncompressedPublicKey)
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.InvalidClientShardError,
      message: `Unable to get address from client shard. The parameter "clientShard" with value "${clientShard}" is NOT valid."`,
    })
  }
}
