// Ronin Testnet
export const FACTORY_ADDRESSES = "0x86587380c4c815ba0066c90adb2b45cc9c15e72c"

export const INIT_CODE_HASH = "0x1cc97ead4d6949b7a6ecb28652b21159b9fd5608ae51a1960224099caab07dca"

const ELLIPSIS = "…"
const MORE_CHAR_NUM = 3

export const truncate = (value: string, prefixChar = 6, suffixChar = 6) => {
  if (value.length > prefixChar + suffixChar + MORE_CHAR_NUM) {
    const prefix = value.substring(0, prefixChar)
    const suffix = value.substring(value.length - suffixChar)
    return `${prefix}${ELLIPSIS}${suffix}`
  } else {
    return value
  }
}

export const truncateAddress = (address: string, prefixChar = 6, suffixChar = 4) => {
  return truncate(address, prefixChar, suffixChar)
}

export const truncateTxHash = (hash: string, prefixChar = 6, suffixChar = 6) => {
  return truncate(hash, prefixChar, suffixChar)
}
