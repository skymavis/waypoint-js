"use client"

import { useWalletgo } from "@roninnetwork/walletgo"

import { ApproveAxs } from "./ApproveAxs"
import { GetAddress } from "./GetAddress"
import { GetRonBalance } from "./GetRonBalance"
import { PersonalSign } from "./PersonalSign"
import { SignTypedDataV4 } from "./SignTypedData"
import { SwapAxsOnKatana } from "./SwapAxsOnKatana"
import { TransferAxs } from "./TransferAxs"
import { TransferRon } from "./TransferRon"
import { ViewAssets } from "./ViewAssets"

export const NewUserActions = () => {
  const { connector } = useWalletgo()
  return (
    <>
      <GetAddress />
      {connector?.id === "mavis-id" && <ViewAssets />}
      <GetRonBalance />
      <PersonalSign />
      <SignTypedDataV4 />
      <TransferRon />
      <TransferAxs />
      <ApproveAxs />
      <SwapAxsOnKatana />
    </>
  )
}
