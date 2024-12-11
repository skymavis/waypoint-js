"use client"

import { useWalletgo } from "@roninnetwork/walletgo"
import { useAtomValue, useSetAtom } from "jotai"
import Link from "next/link"
import { Button } from "src/@/components/ui/button"
import { environmentConfigAtom, switchEnvironmentAtom } from "src/atom/env-config"

const RootPage = () => {
  const { deactivate } = useWalletgo()

  const { clientId, env, waypointOrigin } = useAtomValue(environmentConfigAtom)
  const switchIdEnv = useSetAtom(switchEnvironmentAtom)

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
          <span className="font-bold">Environment:</span>
          <span>{env}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold">Waypoint Origin:</span>
          <span>{waypointOrigin}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold">Client ID:</span>
          <span>{clientId}</span>
        </div>

        <Button className="mt-4 w-[247px]" onClick={handleSwitchEnv}>
          Switch Environment
        </Button>

        <Link href={"/"}>
          <Button className="mt-4 w-[247px]">Back to Home</Button>
        </Link>
      </div>
    </>
  )
}

export default RootPage
