import { getAddress, isAddress } from "viem"

export const validateIdAddress = (responseAddress = "") => {
  try {
    return isAddress(responseAddress) ? getAddress(responseAddress) : undefined
  } catch (error) {
    return undefined
  }
}
