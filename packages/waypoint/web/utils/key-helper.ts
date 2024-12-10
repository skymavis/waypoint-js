export type KeyPair = {
  publicKey: string
  privateKey: string
}

export const ALGORITHM = { name: "RSA-OAEP", hash: "SHA-256" }

export const encodeArrayBufferToBase64 = (arrayBuffer: ArrayBuffer) => {
  const binary = []
  const bytes = new Uint8Array(arrayBuffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary.push(String.fromCharCode(bytes[i] as number))
  }
  return btoa(binary.join(""))
}

export const decodeBase64ToArrayBuffer = (encoded: string) => {
  const data = atob(encoded)
  const len = data.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = data.charCodeAt(i)
  }
  return bytes.buffer
}

export const generateKeyPair = async () => {
  return window.crypto.subtle.generateKey(
    {
      ...ALGORITHM,
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    true,
    ["encrypt", "decrypt"],
  )
}

export const stringifyKeyPair = async (keys: CryptoKeyPair): Promise<KeyPair> => {
  const [publicKeyBuffer, privateKeyBuffer] = await Promise.all([
    window.crypto.subtle.exportKey("spki", keys.publicKey),
    window.crypto.subtle.exportKey("pkcs8", keys.privateKey),
  ])

  const keyPair = {
    publicKey: encodeArrayBufferToBase64(publicKeyBuffer),
    privateKey: encodeArrayBufferToBase64(privateKeyBuffer),
  }

  return keyPair
}

export const decryptClientShard = async (encryptedShard: string, privateKey: CryptoKey) => {
  const decryptedClientShard = await window.crypto.subtle.decrypt(
    { name: ALGORITHM.name },
    privateKey,
    decodeBase64ToArrayBuffer(encryptedShard),
  )

  const clientShard = new TextDecoder().decode(decryptedClientShard)
  return clientShard
}

export const buildPrivateKey = async (privateKey: string) => {
  return window.crypto.subtle.importKey(
    "pkcs8",
    decodeBase64ToArrayBuffer(privateKey),
    ALGORITHM,
    true,
    ["decrypt"],
  )
}
