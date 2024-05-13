import { Button, Link, ProgressCircleLoader, TextField, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { useState } from "react"
import { useGlobalToast } from "src/hooks/useToast"
import { fromFracAmount } from "src/utils/currency"
import { debugError } from "src/utils/debug"

import { Card } from "../Card"
import { Divider } from "../Divider"
import { ResultBox } from "../ResultBox"

const HARDCODE_ADDRESS = "0xedb40e7abaa613a0b06d86260dd55c7eb2df2447"

export const TransferRon = () => {
  const { walletProvider, account } = useWalletgo()
  const { showError, showSuccess } = useGlobalToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [ronAmount, setRonAmount] = useState<string>("0.1")
  const [toAddress, setToAddress] = useState<string>(HARDCODE_ADDRESS)
  const [txHash, setTxHash] = useState<string>()

  const handleTransferRon = async () => {
    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
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

        showSuccess(`Transfer ${ronAmount} RON successfully!`)
      } catch (error) {
        debugError("handleFetchRonBalance", error)
        showError()

        setLoading(false)
      }
    }
  }

  return (
    <>
      <Card>
        <Typo level="display-sm">transfer native token | eth_sendTransaction</Typo>
        <Typo dim className="mt-4 italic" level="body-sm">
          Transfer RON to another address.
        </Typo>

        <TextField
          value={ronAmount}
          onChange={event => {
            setRonAmount(event.target.value)
          }}
          type="number"
          placeholder="RON Amount"
          className="mt-20"
        />

        <TextField
          value={toAddress}
          onChange={event => {
            setToAddress(event.target.value)
          }}
          type="string"
          placeholder="To Address"
          className="mt-20"
        />

        <Button
          fullWidth
          label="Transfer RON"
          className="mt-20"
          onClick={handleTransferRon}
          disabled={!account || loading}
          customRightIcon={
            loading ? <ProgressCircleLoader className="ml-12" size="sm" /> : undefined
          }
        />

        <Divider />

        <Typo level="body-md-strong">Result</Typo>

        <ResultBox className="mt-8">
          {txHash ? (
            <Link
              href={`https://saigon-app.roninchain.com/tx/${txHash}`}
              level="body-md-strong"
              target="_blank"
              className="block truncate"
            >
              {txHash}
            </Link>
          ) : (
            "--"
          )}
        </ResultBox>
      </Card>
    </>
  )
}
