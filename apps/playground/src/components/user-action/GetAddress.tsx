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
import { ID_URL } from "src/connectors/MavisIdConnector"
import { useWrapToast } from "src/hooks/useWrapToast"
import { debugError } from "src/utils/debug"
import { openPopup } from "src/utils/popup"

import { LoadingSpinner } from "../LoadingSpinner"

export const GetAddress = () => {
  const { walletProvider, account, connector } = useWalletgo()
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

  const handleViewAssets = async () => {
    if (!account) {
      toastError("Please connect your wallet first!")
      return
    }

    openPopup(
      `${ID_URL}/wallet/view?clientId=xdemo&redirect=${window.location.origin}&chainId=2021`,
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Address</CardTitle>
        <CardDescription>Get the address from your current wallet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                tabIndex={-1}
                placeholder="Your current address"
                value={address ?? ""}
                readOnly
                type="string"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {connector?.id === "MAVIS_ID_CONNECTOR" && (
          <Button onClick={handleViewAssets} disabled={!account}>
            View assets
          </Button>
        )}

        <Button onClick={handleGetAddress} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Get address
        </Button>
      </CardFooter>
    </Card>
  )
}
