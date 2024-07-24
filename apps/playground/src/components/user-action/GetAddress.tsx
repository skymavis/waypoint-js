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
import { useWrapToast } from "src/hooks/useWrapToast"
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"
import { Result } from "../Result"

export const GetAddress = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastError, toastSuccess, toastConsoleError } = useWrapToast()

  const [address, setAddress] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleGetAddress = async () => {
    setLoading(true)

    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    try {
      const address = await walletProvider.getSigner().getAddress()
      setAddress(address)

      toastSuccess("Get your address successfully!")
      setLoading(false)
    } catch (error) {
      debugError("handleGetAddress", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>eth_requestAccounts</CardTitle>
        <CardDescription>Get the address from your current wallet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid items-center w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <Result placeholder="Your current address" value={address} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={handleGetAddress} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Get address
        </Button>
      </CardFooter>
    </Card>
  )
}
