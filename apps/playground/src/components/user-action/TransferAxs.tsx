"use client"

import { Label } from "@radix-ui/react-label"
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
import { ADDRESS_CONFIG } from "src/config/address"
import { AXS__factory } from "src/contracts"
import { useWrapToast } from "src/hooks/useWrapToast"
import { fromFracAmount } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"
import { Result } from "../Result"

export const TransferAxs = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastSuccess, toastConsoleError } = useWrapToast()

  const [toAddress, setToAddress] = useState<string>("")
  const [axsAmount, setAxsAmount] = useState<string>("0.1")
  const [txHash, setTxHash] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleTransferAxs = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const rawAmount = fromFracAmount(axsAmount, 18)
      const contract = AXS__factory.connect(ADDRESS_CONFIG.AXS, walletProvider.getSigner())
      const txData = await contract.transfer(toAddress, rawAmount)

      setTxHash(txData.hash)
      toastSuccess(`Transfer ${axsAmount} AXS successfully!`)
      setLoading(false)
    } catch (error) {
      debugError("handleTransferAxs", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer ERC20</CardTitle>
        <CardDescription>Transfer your AXS token to another address.</CardDescription>
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
              <Label htmlFor="toAddress">To</Label>
              <Input
                id="toAddress"
                placeholder="Destination address"
                value={toAddress}
                onChange={event => {
                  setToAddress(event.target.value)
                }}
                type="string"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <Result placeholder="Your transaction hash" value={txHash} type="transaction_hash" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleTransferAxs} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Send transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
