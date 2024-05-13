import { Button, Link, ProgressCircleLoader, TextField, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { BigNumber, constants } from "ethers"
import { parseUnits } from "ethers/lib/utils"
import { useState } from "react"
import { addressConfig } from "src/config/address"
import { KatanaRouter__factory } from "src/contracts"
import { useGlobalToast } from "src/hooks/useToast"
import { debugError } from "src/utils/debug"

import { Card } from "../Card"
import { Divider } from "../Divider"
import { ResultBox } from "../ResultBox"

export const SwapAxsOnKatana = () => {
  const { walletProvider, account } = useWalletgo()
  const { showError, showSuccess } = useGlobalToast()

  const [amount, setAmount] = useState<string>("0.1")
  const [txHash, setTxHash] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleSwapAxsToRon = async () => {
    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const katanaRouter = KatanaRouter__factory.connect(
        addressConfig.katana,
        walletProvider.getSigner(),
      )

      const slippageTolerance = parseUnits("2", 18)
      const amountToSwap = parseUnits(amount, 18)
      // If you want to set a minimum based on slippage tolerance, you can do something like this:
      const slippageAmount = amountToSwap.mul(slippageTolerance).div(constants.WeiPerEther)

      let amountOutMin = amountToSwap.sub(slippageAmount)

      // Ensure amountOutMin is never negative
      if (amountOutMin.lt(0)) {
        amountOutMin = BigNumber.from(0)
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from now

      const path = [addressConfig.axs, addressConfig.WRON]

      const swapTX = await katanaRouter.swapExactTokensForRON(
        amountToSwap,
        amountOutMin,
        path,
        account,
        deadline,
        { gasPrice: parseUnits("20", "gwei"), gasLimit: 200000 }, // Set gas price according to network conditions
      )

      showSuccess(`Swap ${amount} AXS successfully!`)
      setTxHash(swapTX.hash)

      setLoading(false)
    } catch (error) {
      debugError("handleSwapAxsToRon", error)
      showError()

      setLoading(false)
    }
  }

  const handleSwapRonToAxs = async () => {
    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const katanaRouter = KatanaRouter__factory.connect(
        addressConfig.katana,
        walletProvider.getSigner(),
      )

      const slippageTolerance = parseUnits("2", 18)
      const amountToSwap = parseUnits(amount, 18)
      // If you want to set a minimum based on slippage tolerance, you can do something like this:
      const slippageAmount = amountToSwap.mul(slippageTolerance).div(constants.WeiPerEther)
      let amountOutMin = amountToSwap.sub(slippageAmount)

      // Ensure amountOutMin is never negative
      if (amountOutMin.lt(0)) {
        amountOutMin = BigNumber.from(0)
      }
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from now
      const path = [addressConfig.WRON, addressConfig.axs]
      const swapTX = await katanaRouter.swapExactRONForTokens(
        amountOutMin,
        path,
        account,
        deadline,
        { gasPrice: parseUnits("20", "gwei"), gasLimit: 200000, value: amountToSwap }, // Set gas price according to network conditions
      )

      showSuccess(`Swap ${amount} RON successfully!`)
      setTxHash(swapTX.hash)

      setLoading(false)
    } catch (error) {
      debugError("handleSwapRonToAxs", error)
      showError()

      setLoading(false)
    }
  }

  return (
    <Card>
      <Typo level="display-sm">swap on katana | eth_sendTransaction</Typo>
      <Typo dim className="mt-4 italic" level="body-sm">
        Swap AXS to RON or vice versa
      </Typo>

      <TextField
        type="string"
        placeholder="AXS Amount"
        className="mt-20"
        value={amount}
        onChange={event => setAmount(event.target.value)}
      />

      <div className="mt-20 flex gap-12">
        <Button
          fullWidth
          label="Swap AXS to RON"
          onClick={handleSwapAxsToRon}
          disabled={!account || loading}
          customRightIcon={
            loading ? <ProgressCircleLoader className="ml-12" size="sm" /> : undefined
          }
        />

        <Button
          fullWidth
          label="Swap RON to AXS"
          onClick={handleSwapRonToAxs}
          disabled={!account || loading}
          customRightIcon={
            loading ? <ProgressCircleLoader className="ml-12" size="sm" /> : undefined
          }
        />
      </div>

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
  )
}
