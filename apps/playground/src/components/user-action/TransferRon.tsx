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
import { useWrapToast } from "src/hooks/useWrapToast"
import { fromFracAmount } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"
import { Result } from "../Result"

export const TransferRon = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastSuccess, toastConsoleError, toastError } = useWrapToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [ronAmount, setRonAmount] = useState<string>("0.1")
  const [toAddress, setToAddress] = useState<string>("")
  const [txHash, setTxHash] = useState<string>()

  const handleTransferRon = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    if (ronAmount) {
      setLoading(true)

      try {
        const rawAmount = fromFracAmount(ronAmount, 18)
        const tx = await walletProvider
          .getSigner()
          .sendTransaction({ to: toAddress, value: rawAmount })

        setTxHash(tx.hash)
        setLoading(false)

        toastSuccess(`Transfer ${ronAmount} RON successfully!`)
      } catch (error) {
        debugError("handleFetchRonBalance", error)
        toastConsoleError()

        setLoading(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer RON</CardTitle>
        <CardDescription>Transfer your native token to another address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid items-center w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ronAmount">Amount</Label>
              <Input
                id="ronAmount"
                placeholder="Your RON amount"
                value={ronAmount}
                onChange={event => {
                  setRonAmount(event.target.value)
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
        <Button onClick={handleTransferRon} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Send transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
