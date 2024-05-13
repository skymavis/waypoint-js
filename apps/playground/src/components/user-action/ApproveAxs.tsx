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
import { addressConfig } from "src/config/address"
import { AXS__factory } from "src/contracts"
import { useWrapToast } from "src/hooks/useWrapToast"
import { fromFracAmount } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"

export const ApproveAxs = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastSuccess, toastConsoleError } = useWrapToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [spender, setSpender] = useState<string>(addressConfig.katana)
  const [axsAmount, setAxsAmount] = useState<string>("0.1")
  const [txHash, setTxHash] = useState<string>()

  const handleApproveAxs = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const rawAmount = fromFracAmount(axsAmount, 18)
      const contract = AXS__factory.connect(addressConfig.axs, walletProvider.getSigner())
      const txData = await contract.approve(spender, rawAmount)

      setTxHash(txData.hash)
      toastSuccess(`Approve ${axsAmount} AXS successfully!`)
      setLoading(false)
    } catch (error) {
      debugError("handleApproveAxs", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve ERC20</CardTitle>
        <CardDescription>Approve for other contracts to use your AXS.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
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
              <Label htmlFor="spenderAddress">Spender</Label>
              <Input
                id="spenderAddress"
                placeholder="Spender's address"
                value={spender}
                onChange={event => {
                  setSpender(event.target.value)
                }}
                type="string"
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
        <Button onClick={handleApproveAxs} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Send transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
