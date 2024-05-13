import { BigNumber, parseFixed } from "@ethersproject/bignumber"
import { formatEther } from "@ethersproject/units"

export const formatBalance = (amount: BigNumber) => {
  const remainder = amount.mod(1e14)
  return formatEther(amount.sub(remainder))
}
// return Big Number for Ethereum standard
export const fromFracAmount = (fracAmount: string, decimals: number): BigNumber => {
  const rawAmount = parseFixed(fracAmount.toString(), decimals)
  return rawAmount
}
