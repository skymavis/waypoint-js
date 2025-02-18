import CryptoJS from "crypto-js"

function base64UrlEncode(wordArray: CryptoJS.lib.WordArray) {
  const base64 = CryptoJS.enc.Base64.stringify(wordArray)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function generateCodeChallenge(codeVerifier: string) {
  const hash = CryptoJS.SHA256(codeVerifier)
  return base64UrlEncode(hash)
}

export function generateRandomString(length: number = 64) {
  const randomBytes = CryptoJS.lib.WordArray.random(length)
  return base64UrlEncode(randomBytes).slice(0, length)
}
