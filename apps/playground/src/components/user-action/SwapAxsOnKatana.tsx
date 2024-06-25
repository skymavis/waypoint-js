"use client"

import { Label } from "@radix-ui/react-label"
import { useWalletgo } from "@roninnetwork/walletgo"
import { BigNumber, constants } from "ethers"
import { parseUnits } from "ethers/lib/utils"
import { useState } from "react"
import { Button } from "src/@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/@/components/ui/card"
import { Input } from "src/@/components/ui/input"
import { ADDRESS_CONFIG } from "src/config/address"
import { KatanaRouter__factory } from "src/contracts"
import { useWrapToast } from "src/hooks/useWrapToast"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"

export const SwapAxsOnKatana = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastConsoleError, toastSuccess } = useWrapToast()

  const [amount, setAmount] = useState<string>("0.1")
  const [txHash, setTxHash] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleSwapAxsToRon = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const katanaRouter = KatanaRouter__factory.connect(
        ADDRESS_CONFIG.KATANA,
        walletProvider.getSigner(),
      )

      const slippageTolerance = parseUnits("2", 18)
      const amountToSwap = parseUnits(amount, 18)
      // If you want to set a minimum based on slippage tolerance, you can do something like this:
      const slippageAmount = amountToSwap.mul(slippageTolerance).div(constants.WeiPerEther)

      let amountOutMin = amountToSwap.sub(slippageAmount)

      // Ensure amountOutMin is never negative
      if (amountOutMin.lt(0)) {
        amountOutMin = BigNumber.from(0)
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from now

      const path = [ADDRESS_CONFIG.AXS, ADDRESS_CONFIG.WRON]

      const swapTX = await katanaRouter.swapExactTokensForRON(
        amountToSwap,
        amountOutMin,
        path,
        account,
        deadline,
      )

      toastSuccess(`Swap ${amount} AXS successfully!`)
      setTxHash(swapTX.hash)

      setLoading(false)
    } catch (error) {
      debugError("handleSwapAxsToRon", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  const handleSwapRonToAxs = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const katanaRouter = KatanaRouter__factory.connect(
        ADDRESS_CONFIG.KATANA,
        walletProvider.getSigner(),
      )

      const slippageTolerance = parseUnits("2", 18)
      const amountToSwap = parseUnits(amount, 18)
      // If you want to set a minimum based on slippage tolerance, you can do something like this:
      const slippageAmount = amountToSwap.mul(slippageTolerance).div(constants.WeiPerEther)
      let amountOutMin = amountToSwap.sub(slippageAmount)

      // Ensure amountOutMin is never negative
      if (amountOutMin.lt(0)) {
        amountOutMin = BigNumber.from(0)
      }
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from now
      const path = [ADDRESS_CONFIG.WRON, ADDRESS_CONFIG.AXS]
      const swapTX = await katanaRouter.swapExactRONForTokens(
        amountOutMin,
        path,
        account,
        deadline,
        { value: amountToSwap },
      )

      toastSuccess(`Swap ${amount} RON successfully!`)
      setTxHash(swapTX.hash)

      setLoading(false)
    } catch (error) {
      debugError("handleSwapRonToAxs", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Katana</CardTitle>
        <CardDescription>Swap AXS & RON on Katana.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                placeholder="Swap amount"
                value={amount}
                onChange={event => {
                  setAmount(event.target.value)
                }}
                type="number"
                min={0}
                max={999999999}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                tabIndex={-1}
                placeholder="Your transaction hash"
                value={txHash ?? ""}
                readOnly
                type="string"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-1">
        <Button onClick={handleSwapAxsToRon} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Swap to RON
        </Button>

        <Button onClick={handleSwapRonToAxs} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Swap to AXS
        </Button>
      </CardFooter>
    </Card>
  )
}
