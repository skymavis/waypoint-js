import { jwtDecode } from "jwt-decode"
import { stringToBytes } from "viem"

const createDerivedKey = async (password: Uint8Array, salt: Uint8Array) => {
  const baseKey = await window.crypto.subtle.importKey("raw", password, { name: "PBKDF2" }, false, [
    "deriveKey",
  ])
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 4096,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )

  return derivedKey
}

const DEFAULT_ISS = "https://athena.skymavis.com/"
export const deriveKey = async (waypointToken: string, recoveryPassword: string) => {
  const { sub } = jwtDecode(waypointToken)

  const salt = stringToBytes(`${DEFAULT_ISS}:${sub}`)
  const password = stringToBytes(`${DEFAULT_ISS}:${sub}:${recoveryPassword}`)

  return await createDerivedKey(password, salt)
}
