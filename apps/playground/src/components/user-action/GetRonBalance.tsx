"use client"

import { Label } from "@radix-ui/react-label"
import { useWalletgo } from "@roninnetwork/walletgo"
import { BigNumber } from "ethers"
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
import { Result } from "src/@/components/ui/result"
import { useWrapToast } from "src/hooks/useWrapToast"
import { formatBalance } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"

export const GetRonBalance = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastConsoleError, toastSuccess } = useWrapToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [ronBalance, setRonBalance] = useState<BigNumber>()

  const handleFetchRonBalance = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)
    setRonBalance(undefined)

    try {
      const balance = await walletProvider.getBalance(account)

      setRonBalance(balance)
      toastSuccess("Get your RON balance successfully!")

      setLoading(false)
    } catch (error) {
      debugError("handleFetchRonBalance", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>eth_getBalance</CardTitle>
        <CardDescription>Get the RON balance of your current account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid items-center w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <Result
                placeholder="Your RON balance"
                value={ronBalance ? formatBalance(ronBalance) : ""}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleFetchRonBalance} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Get balance
        </Button>
      </CardFooter>
    </Card>
  )
}
