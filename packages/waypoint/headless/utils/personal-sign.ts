import type { Hex } from "viem"
import { concatBytes, presignMessagePrefix, stringToBytes, toBytes } from "viem"

import { bytesToBase64 } from "./convertor"

export const normalizeSignMessage = (message: Hex | string) => {
  const messageBytes = toBytes(message)
  const prefixBytes = stringToBytes(`${presignMessagePrefix}${messageBytes.length}`)

  return concatBytes([prefixBytes, messageBytes])
}

export const toWasmSignMessage = (message: Hex | string) =>
  bytesToBase64(normalizeSignMessage(message))
