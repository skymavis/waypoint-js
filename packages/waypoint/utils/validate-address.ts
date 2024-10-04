import { getAddress, isAddress } from "viem"

export const validateIdAddress = (responseAddress?: string | null) => {
  try {
    return responseAddress && isAddress(responseAddress) ? getAddress(responseAddress) : undefined
  } catch (error) {
    return undefined
  }
}
