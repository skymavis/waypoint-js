"use client"

import { useWalletgo } from "@roninnetwork/walletgo"
import { useAtomValue, useSetAtom } from "jotai"
import Link from "next/link"
import { Button } from "src/@/components/ui/button"
import { idConfigAtom, switchIdConfigAtom } from "src/atom/env-config"

const RootPage = () => {
  const { deactivate } = useWalletgo()

  const idConfig = useAtomValue(idConfigAtom)
  const switchIdEnv = useSetAtom(switchIdConfigAtom)

  const handleSwitchEnv = () => {
    try {
      deactivate()
    } catch (error) {
      /* empty */
    }

    switchIdEnv()
  }

  return (
    <>
      <div className="flex flex-col h-screen w-screen items-center justify-center p-16">
        <div className="flex gap-2">
          <span className="font-bold">ID Origin:</span>
          <span>{idConfig.origin}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold">Client ID:</span>
          <span>{idConfig.clientId}</span>
        </div>
        <Button className="mt-4 w-[247px]" onClick={handleSwitchEnv}>
          Switch ID Origin
        </Button>

        <Link href={"/"}>
          <Button className="mt-4 w-[247px]">Back to Home</Button>
        </Link>
      </div>
    </>
  )
}

export default RootPage
