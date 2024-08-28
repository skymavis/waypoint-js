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
import { WRON__factory } from "src/contracts"
import { useWrapToast } from "src/hooks/useWrapToast"
import { fromFracAmount } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"
import { Result } from "../Result"

export const TransferWron = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastSuccess, toastConsoleError } = useWrapToast()

  const [toAddress, setToAddress] = useState<string>("")
  const [wronAmount, setWronAmount] = useState<string>("0.1")
  const [txHash, setTxHash] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleTransferWron = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const rawAmount = fromFracAmount(wronAmount, 18)
      const contract = WRON__factory.connect(ADDRESS_CONFIG.WRON, walletProvider.getSigner())
      const txData = await contract.transfer(toAddress, rawAmount, {
        gasLimit: 1000000,
      })

      setTxHash(txData.hash)
      toastSuccess(`Transfer ${wronAmount} WRON successfully!`)
      setLoading(false)
    } catch (error) {
      debugError("handleTransferWron", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer WRON</CardTitle>
        <CardDescription>Transfer your WRON token to another address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid items-center w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="wronAmount">Amount</Label>
              <Input
                id="wronAmount"
                placeholder="Your WRON amount"
                value={wronAmount}
                onChange={event => {
                  setWronAmount(event.target.value)
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
        <Button onClick={handleTransferWron} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Send transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
