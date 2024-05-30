import { getAddress, isHex } from "viem"

export const validateIdAddress = (responseAddress: string | undefined) => {
  try {
    return isHex(responseAddress) ? getAddress(responseAddress) : undefined
  } catch (error) {
    return undefined
  }
}
