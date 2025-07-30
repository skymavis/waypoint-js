import { encryptContent } from "./key-actions"

export const encryptClientShard = async ({
  shard,
  publicKey,
}: {
  shard: string
  publicKey: string
}) => {
  const { encryptedContent: publicKeyEncrypted, contentKey } = await encryptContent(publicKey)

  const shardBytes = new TextEncoder().encode(shard)
  const cryptoKey = await crypto.subtle.importKey("raw", contentKey, { name: "AES-GCM" }, false, [
    "encrypt",
  ])
  const nonce = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    cryptoKey,
    shardBytes,
  )

  const shardCiphertextB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  const shardEncryptedKeyB64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyEncrypted)))
  const shardNonceB64 = btoa(String.fromCharCode(...nonce))

  return {
    shardCiphertextB64,
    shardEncryptedKeyB64,
    shardNonceB64,
  }
}

export const decryptClientShard = async ({
  shardCiphertextB64,
  shardNonceB64,
  aesKey,
}: {
  shardCiphertextB64: string
  shardNonceB64: string
  aesKey: Uint8Array
}) => {
  const nonce = Uint8Array.from(atob(shardNonceB64), c => c.charCodeAt(0))
  const encryptedShard = Uint8Array.from(atob(shardCiphertextB64), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey("raw", aesKey, { name: "AES-GCM" }, false, [
    "decrypt",
  ])

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    cryptoKey,
    encryptedShard,
  )

  const shardString = new TextDecoder().decode(decrypted)

  return shardString
}
