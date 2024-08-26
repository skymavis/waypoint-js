"use client"

import { useWalletgo } from "@roninnetwork/walletgo"
import { Button } from "src/@/components/ui/button"
import { RoninLogo } from "src/connectors/RoninLogo"
import { useWalletgoDialog } from "src/hooks/useWalletgoDialog"
import { truncateAddress } from "src/utils/address"

export const Intro = () => {
  const { account } = useWalletgo()
  const { setOpen } = useWalletgoDialog()

  return (
    <>
      <RoninLogo width={88} />

      <div className="mt-4 text-4xl font-bold tracking-wide lg:text-5xl">Ronin Waypoint</div>
      <div className="mt-0 text-sm italic font-medium">by Sky Mavis</div>

      <div className="mt-2 font-semibold lg:mt-8">Welcome to Ronin Waypoint Demo</div>
      <div className="mt-1 max-w-[400px] text-sm font-medium italic">
        With this sample app, you can explore the various features of basic Ronin Waypoint wallet
        and get a feel for how it can benefit your own project.
      </div>

      <div className="mt-6 text-xl font-bold lg:mt-12">Use Ronin Waypoint Wallet</div>
      <Button className="mt-2 w-[247px]" onClick={() => setOpen(true)}>
        {account ? truncateAddress(account) : "Connect your wallet"}
      </Button>
      {account && (
        <div className="mt-2 text-sm font-medium text-green-600">
          Connected! Now you could interact with wallet features.
        </div>
      )}

      {/* <div className="mt-8 text-xl font-bold">Authorize User</div>

      <Authorize />
      <RedirectAuthorize /> */}
    </>
  )
}
