/* eslint-disable prettier/prettier */
import { Button, ProgressCircleLoader, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { BigNumber } from "ethers"
import { useState } from "react"
import { useGlobalToast } from "src/hooks/useToast"
import { formatBalance } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { Card } from "../Card"
import { Divider } from "../Divider"
import { ResultBox } from "../ResultBox"

export const GetRonBalance = () => {
  const { walletProvider, account } = useWalletgo()
  const { showError, showSuccess } = useGlobalToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [ronBalance, setRonBalance] = useState<BigNumber>()

  const handleFetchRonBalance = async () => {
    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
      return
    }

    setLoading(true)
    setRonBalance(undefined)

    try {
      const balance = await walletProvider.getBalance(account)

      setRonBalance(balance)
      showSuccess("Get your RON balance successfully!")

      setLoading(false)
    } catch (error) {
      debugError("handleFetchRonBalance", error)
      showError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <Typo level="display-sm">eth_getBalance</Typo>
      <Typo dim className="mt-4 italic" level="body-sm">
        Returns the RON balance of the account of given address.
      </Typo>

      <Button
        fullWidth
        label="Get RON Balance"
        onClick={handleFetchRonBalance}
        className="mt-20"
        disabled={!account || loading}
        customRightIcon={loading ? <ProgressCircleLoader className="ml-12" size="sm" /> : undefined}
      />

      <Divider />

      <Typo level="body-md-strong">Result</Typo>
      <ResultBox className="mt-8 flex flex-col gap-8">
        <Typo level="body-md-strong">{ronBalance?.toString() ?? "--"} wei</Typo>

        <Typo level="body-md-strong">{!ronBalance ? "--" : formatBalance(ronBalance)} RON</Typo>
      </ResultBox>
    </Card>
  )
}
