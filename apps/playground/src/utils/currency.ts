import { parseFixed } from "@ethersproject/bignumber"
import { BigNumber } from "ethers"
import { formatEther } from "ethers/lib/utils"

export const formatBalance = (amount: BigNumber) => {
  const remainder = amount.mod(1e14)
  return formatEther(amount.sub(remainder))
}
// return Big Number for Ethereum standard
export const fromFracAmount = (fracAmount: string, decimals: number): BigNumber => {
  const rawAmount = parseFixed(fracAmount.toString(), decimals)
  return rawAmount
}
