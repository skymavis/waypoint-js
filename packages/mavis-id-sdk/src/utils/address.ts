const RONIN_PREFIX = "ronin:"
const ZERO_PREFIX = "0x"

export const convertToZeroAddress = (address: string) => {
  if (address.startsWith(RONIN_PREFIX)) {
    const evmAddress = address.replace(RONIN_PREFIX, ZERO_PREFIX)
    return evmAddress
  }

  return address
}
