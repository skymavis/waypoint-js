"use client"

import { useWalletgo } from "@roninnetwork/walletgo"
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
import { Label } from "src/@/components/ui/label"
import { ADDRESS_CONFIG } from "src/config/address"
import { ERC20StakingPool__factory } from "src/contracts"
import { useWrapToast } from "src/hooks/useWrapToast"
import { fromFracAmount } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"

export const StakingAxs = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastSuccess, toastConsoleError } = useWrapToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [axsAmount, setAxsAmount] = useState<string>("0.1")
  const [txHash, setTxHash] = useState<string>()

  const handleStakeAxs = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const rawAmount = fromFracAmount(axsAmount, 18)
      const contract = ERC20StakingPool__factory.connect(
        ADDRESS_CONFIG.AXS_STAKING,
        walletProvider.getSigner(),
      )
      const txData = await contract.stake(rawAmount)

      setTxHash(txData.hash)
      toastSuccess(`Stake ${axsAmount} AXS successfully!`)
      setLoading(false)
    } catch (error) {
      debugError("handleStakeAxs", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake AXS</CardTitle>
        <CardDescription>Stake your AXS to earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid items-center w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="axsAmount">Amount</Label>
              <Input
                id="axsAmount"
                placeholder="Your AXS amount"
                value={axsAmount}
                onChange={event => {
                  setAxsAmount(event.target.value)
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
      <CardFooter className="flex justify-end">
        <Button onClick={handleStakeAxs} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Send transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
