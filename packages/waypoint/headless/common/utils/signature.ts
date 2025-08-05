import { type Hex, parseSignature, serializeSignature } from "viem"

export const toEthereumSignature = (sig: Hex) => serializeSignature(parseSignature(sig))
