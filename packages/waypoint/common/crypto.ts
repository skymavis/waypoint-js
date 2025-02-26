import { sha256 } from "@noble/hashes/sha256"
import { randomBytes } from "@noble/hashes/utils"

function base64UrlEncode(buffer: Uint8Array) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function generateCodeChallenge(codeVerifier: string) {
  const hash = sha256(new TextEncoder().encode(codeVerifier))
  return base64UrlEncode(hash)
}

export function generateRandomString() {
  const bytes = randomBytes(48)
  return base64UrlEncode(bytes)
}
