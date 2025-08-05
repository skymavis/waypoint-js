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
