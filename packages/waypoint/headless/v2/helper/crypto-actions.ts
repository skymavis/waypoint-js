export const AESEncrypt = async ({ content, key }: { content: string; key: string }) => {
  const { encryptedContent: publicKeyEncrypted, encryptionKey } = await encryptContent(key)

  const contentBytes = new TextEncoder().encode(content)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encryptionKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  )
  const nonce = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    cryptoKey,
    contentBytes,
  )

  const ciphertextB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  const encryptedKeyB64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyEncrypted)))
  const nonceB64 = btoa(String.fromCharCode(...nonce))

  return {
    ciphertextB64,
    encryptedKeyB64,
    nonceB64,
  }
}

export const AESDecrypt = async ({
  ciphertextB64,
  nonceB64,
  aesKey,
}: {
  ciphertextB64: string
  nonceB64: string
  aesKey: Uint8Array
}) => {
  const nonce = Uint8Array.from(atob(nonceB64), c => c.charCodeAt(0))
  const encryptedContent = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey("raw", aesKey, { name: "AES-GCM" }, false, [
    "decrypt",
  ])

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    cryptoKey,
    encryptedContent,
  )

  const contentString = new TextDecoder().decode(decrypted)

  return contentString
}

export const encryptContent = async (content: string, key?: Uint8Array) => {
  const encryptionKey = key ?? crypto.getRandomValues(new Uint8Array(32))

  const pemHeader = "-----BEGIN PUBLIC KEY-----"
  const pemFooter = "-----END PUBLIC KEY-----"
  const pemContents = content.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "")
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const rsaPublicKey = await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  )

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    rsaPublicKey,
    encryptionKey,
  )

  return {
    encryptedContent,
    encryptionKey,
  }
}
