import { bytesToHex, type Hex, hexToBytes } from "viem"

// * STRING
// ! WHY: stringToBytes from "viem" do NOT working with base64
// * wasm & socket working with base64 string
const stringToBytes = (value: string) => {
  const charCode = Array.from(value, m => m.codePointAt(0) as number)

  return Uint8Array.from(charCode)
}
const bytesToString = (bytes: Uint8Array) => {
  return Array.from(bytes, b => String.fromCodePoint(b)).join("")
}

// * BASE64
export const bytesToBase64 = (bytes: Uint8Array) => btoa(bytesToString(bytes))
export const base64ToBytes = (base64: string) => stringToBytes(atob(base64))

export const base64ToHex = (base64: string) => bytesToHex(base64ToBytes(base64))
export const hexToBase64 = (hex: Hex) => bytesToBase64(hexToBytes(hex))

// * JSON
// ! WHY: wasm using base64 string for json
// TODO: should refactor
export const bytesToJson = (bytes: Uint8Array) => {
  const jsonInStr = bytesToString(bytes)

  return JSON.parse(jsonInStr)
}
export const jsonToBytes = (json: unknown) => {
  const jsonInStr = JSON.stringify(json, null, 0)

  return stringToBytes(jsonInStr)
}

export const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
}
