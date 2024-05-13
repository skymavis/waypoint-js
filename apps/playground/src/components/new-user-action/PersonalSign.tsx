import { Button, ProgressCircleLoader, TextArea, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { verifyMessage } from "ethers/lib/utils"
import { useState } from "react"
import { useGlobalToast } from "src/hooks/useToast"
import { debugError } from "src/utils/debug"

import { Card } from "../Card"
import { Divider } from "../Divider"
import { ResultBox } from "../ResultBox"

export const PersonalSign = () => {
  const { walletProvider, account } = useWalletgo()
  const { showError, showSuccess } = useGlobalToast()

  const [signMessage, setSignMessage] = useState<string>("Hello axie")
  const [signResult, setSignResult] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handlePersonalSign = async () => {
    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const sig = await walletProvider.getSigner().signMessage(signMessage)
      const recoverAddress = verifyMessage(signMessage, sig)

      if (recoverAddress === account) {
        setSignResult(sig)
        showSuccess("Signature is valid!")
      } else {
        showError("Signature is invalid!")
      }

      setLoading(false)
    } catch (error) {
      debugError("handlePersonalSign", error)
      showError()

      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <Typo level="display-sm">personal_sign</Typo>
        <Typo dim className="mt-4 italic" level="body-sm">
          Presents a plain text signature challenge to the user and returns the signed response.
        </Typo>

        <TextArea
          value={signMessage}
          rows={1}
          onChange={event => {
            setSignMessage(event.target.value)
          }}
          className="mt-28"
        />

        <Button
          fullWidth
          label="Sign"
          className="mt-20"
          onClick={handlePersonalSign}
          disabled={!account || loading}
          customRightIcon={
            loading ? <ProgressCircleLoader className="ml-12" size="sm" /> : undefined
          }
        />

        <Divider />

        <Typo level="body-md-strong">Result</Typo>
        <ResultBox className="mt-8">{signResult ?? "--"}</ResultBox>
      </Card>
    </>
  )
}
