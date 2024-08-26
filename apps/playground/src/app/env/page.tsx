"use client"

import { useWalletgo } from "@roninnetwork/walletgo"
import { useAtomValue, useSetAtom } from "jotai"
import Link from "next/link"
import { Button } from "src/@/components/ui/button"
import { switchWaypointConfigAtom, waypointConfigAtom } from "src/atom/env-config"

const RootPage = () => {
  const { deactivate } = useWalletgo()

  const providerConfig = useAtomValue(waypointConfigAtom)
  const switchIdEnv = useSetAtom(switchWaypointConfigAtom)

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
      <div className="flex flex-col items-center justify-center w-screen h-screen p-16">
        <div className="flex gap-2">
          <span className="font-bold">Ronin Waypoint Origin:</span>
          <span>{providerConfig.origin}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold">Client ID:</span>
          <span>{providerConfig.clientId}</span>
        </div>
        <Button className="mt-4 w-[247px]" onClick={handleSwitchEnv}>
          Switch Ronin Waypoint Origin
        </Button>

        <Link href={"/"}>
          <Button className="mt-4 w-[247px]">Back to Home</Button>
        </Link>
      </div>
    </>
  )
}

export default RootPage
