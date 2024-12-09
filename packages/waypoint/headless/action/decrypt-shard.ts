import { bytesToString, concatBytes } from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { base64ToBytes } from "../utils/convertor"
import { IV_LENGTH_BYTE, TAG_LENGTH_BYTE } from "./encrypt-shard"
import { deriveKey } from "./helpers/key"

const unpackEncryptedContent = (
  packedContent: string,
): {
  iv: Uint8Array
  authTag: Uint8Array
  cipherText: Uint8Array
} => {
  const l2InBytes = base64ToBytes(packedContent)
  const l1InBase64 = bytesToString(l2InBytes)
  const content = base64ToBytes(l1InBase64)

  const ivSize = content[0] ?? IV_LENGTH_BYTE // * 1st byte: iv size
  const authTagSize = content[1] ?? TAG_LENGTH_BYTE // * 2nd byte: auth tag size

  const iv = content.slice(2, 2 + ivSize)
  const cipherText = content.slice(2 + ivSize, content.length - authTagSize)
  const authTag = content.slice(content.length - authTagSize)

  return { iv, authTag, cipherText }
}

const getV1PackedContent = (encryptedData: string) => {
  const parts = encryptedData.split(".")
  const v1Content = parts[0]

  if (!v1Content) {
    throw "Encrypted content is empty."
  }

  return v1Content
}

export type DecryptShardParams = {
  waypointToken: string
  recoveryPassword: string

  encryptedData: string
}

export const decryptShard = async (params: DecryptShardParams) => {
  try {
    const { waypointToken, recoveryPassword, encryptedData } = params

    const v1PackedContent = getV1PackedContent(encryptedData)
    const { authTag, cipherText, iv } = unpackEncryptedContent(v1PackedContent)

    const key = await deriveKey(waypointToken, recoveryPassword)
    const shardInBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      concatBytes([cipherText, authTag]),
    )
    const shardInBase64 = bytesToString(new Uint8Array(shardInBytes))

    return shardInBase64
  } catch (error) {
    throw new HeadlessClientError({
      cause: error,
      code: HeadlessClientErrorCode.DecryptClientShardError,
      message: "Unable to decrypt the client shard. It is probably the wrong recovery password.",
    })
  }
}
