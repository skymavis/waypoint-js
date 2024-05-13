import { Button, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { useState } from "react"
import { useGlobalToast } from "src/hooks/useToast"
import { debugError } from "src/utils/debug"

import { Card } from "../Card"
import { Divider } from "../Divider"
import { ResultBox } from "../ResultBox"

export const GetAddress = () => {
  const { showError, showSuccess } = useGlobalToast()

  const { walletProvider, account } = useWalletgo()

  const [address, setAddress] = useState<string>()

  const handleGetAddress = async () => {
    setAddress(undefined)

    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
      return
    }

    try {
      const address = await walletProvider.getSigner().getAddress()
      setAddress(address)

      showSuccess("Get your address successfully!")
    } catch (error) {
      debugError("handleGetAddress", error)
      showError()
    }
  }

  return (
    <Card>
      <Typo level="display-sm">eth_accounts</Typo>
      <Typo dim className="mt-4 italic" level="body-sm">
        Get the address from your current wallet.
      </Typo>

      <Button fullWidth label="Get Address" onClick={handleGetAddress} className="mt-20" />

      <Divider />

      <Typo level="body-md-strong">Result</Typo>
      <ResultBox className="mt-8">
        <Typo level="body-md-strong">{address ?? "--"}</Typo>
      </ResultBox>
    </Card>
  )
}
