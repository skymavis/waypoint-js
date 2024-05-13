"use client"

import { Label } from "@radix-ui/react-label"
import { useWalletgo } from "@roninnetwork/walletgo"
import { verifyMessage } from "ethers/lib/utils"
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
import { debugError } from "src/utils/debug"

import { LoadingSpinner } from "../LoadingSpinner"

export const PersonalSign = () => {
  const { walletProvider, account } = useWalletgo()
  const { toastSuccess, toastError, toastConsoleError } = useWrapToast()

  const [signMessage, setSignMessage] = useState<string>("Hello axie")
  const [signResult, setSignResult] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handlePersonalSign = async () => {
    if (!walletProvider || !account) {
      toastError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const sig = await walletProvider.getSigner().signMessage(signMessage)
      const recoverAddress = verifyMessage(signMessage, sig)

      if (recoverAddress === account) {
        setSignResult(sig)
        toastSuccess("Signature is valid!")
      } else {
        toastError("Signature is invalid!")
      }

      setLoading(false)
    } catch (error) {
      debugError("handlePersonalSign", error)
      toastConsoleError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Sign</CardTitle>
        <CardDescription>
          Presents a plain text signature challenge to the user and returns the signed response.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="signMessage">Message</Label>
              <Input
                id="signMessage"
                placeholder="Sign message"
                value={signMessage}
                onChange={event => {
                  setSignMessage(event.target.value)
                }}
                type="string"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                tabIndex={-1}
                placeholder="Your signature"
                value={signResult ?? ""}
                readOnly
                type="string"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handlePersonalSign} disabled={!account || loading} className="gap-1">
          {loading && <LoadingSpinner />}
          Sign message
        </Button>
      </CardFooter>
    </Card>
  )
}
