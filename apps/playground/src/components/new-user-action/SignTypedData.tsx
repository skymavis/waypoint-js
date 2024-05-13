import { Button, ProgressCircleLoader, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { splitSignature, verifyTypedData } from "ethers/lib/utils"
import { useState } from "react"
import { useGlobalToast } from "src/hooks/useToast"
import { debugError } from "src/utils/debug"

import { Card } from "../Card"
import { Divider } from "../Divider"
import { ResultBox } from "../ResultBox"

const SIGN_DATA = {
  types: {
    Asset: [
      { name: "erc", type: "uint8" },
      { name: "addr", type: "address" },
      { name: "id", type: "uint256" },
      { name: "quantity", type: "uint256" },
    ],
    Order: [
      { name: "maker", type: "address" },
      { name: "kind", type: "uint8" },
      { name: "assets", type: "Asset[]" },
      { name: "expiredAt", type: "uint256" },
      { name: "paymentToken", type: "address" },
      { name: "startedAt", type: "uint256" },
      { name: "basePrice", type: "uint256" },
      { name: "endedAt", type: "uint256" },
      { name: "endedPrice", type: "uint256" },
      { name: "expectedState", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "marketFeePercentage", type: "uint256" },
    ],
  },
  domain: {
    name: "MarketGateway",
    version: "1",
    chainId: "2021",
    verifyingContract: "0xfff9ce5f71ca6178d3beecedb61e7eff1602950e",
  },
  primaryType: "Order",
  message: {
    maker: "0xd761024b4ef3336becd6e802884d0b986c29b35a",
    kind: 1,
    assets: [
      {
        erc: 1,
        addr: "0x32950db2a7164ae833121501c797d79e7b79d74c",
        id: "2730069",
        quantity: "0",
      },
    ],
    expiredAt: "1721709637",
    paymentToken: "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5",
    startedAt: "1705984837",
    basePrice: "500000000000000000",
    endedAt: "0",
    endedPrice: "0",
    expectedState: "0",
    nonce: "0",
    marketFeePercentage: "425",
  },
}

export const SignTypedDataV4 = () => {
  const { walletProvider, account } = useWalletgo()
  const { showError, showSuccess } = useGlobalToast()

  const [signResult, setSignResult] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const handleSignTypedData = async () => {
    if (!walletProvider || !account) {
      showError("Please connect your wallet first!")
      return
    }

    setLoading(true)

    try {
      const result = await walletProvider
        .getSigner()
        ._signTypedData(SIGN_DATA.domain, SIGN_DATA.types, SIGN_DATA.message)

      const sigLike = splitSignature(result)
      const recoverAddress = verifyTypedData(
        SIGN_DATA.domain,
        SIGN_DATA.types,
        SIGN_DATA.message,
        sigLike,
      )

      if (recoverAddress === account) {
        setSignResult(result)
        showSuccess("Signature is valid!")
      } else {
        showError("Signature is invalid!")
      }

      setLoading(false)
    } catch (error) {
      debugError("handleSignTypedData", error)
      showError()

      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <Typo level="display-sm">eth_signTypedData_v4</Typo>
        <Typo dim className="mt-4 italic" level="body-sm">
          Presents a data message for the user to sign in a structured and readable format and
          returns the signed response.
        </Typo>

        <Button
          fullWidth
          label="Sign"
          className="mt-20"
          onClick={handleSignTypedData}
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
