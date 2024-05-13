"use client"

import { Button, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgoDialog } from "src/hooks/useWalletgoDialog"

import MobileRoninLogoSvg from "./MobileRoninLogoSvg"

export const Intro = () => {
  const { setOpen } = useWalletgoDialog()

  return (
    <>
      <MobileRoninLogoSvg width={80} />
      <Typo level="display-lg" className="mt-28 font-bold">
        Wallet X &nbsp;|&nbsp; MPC demo
      </Typo>
      <Typo dim className="italic" level="body-sm">
        by Ronin
      </Typo>

      <Typo className="mt-24" level="body-md-strong">
        Welcome to MPC Alpha Sample App.
      </Typo>
      <Typo className="mt-8 max-w-[400px]" level="body-md">
        With this alpha sample app, you can explore the various features of basic MPC wallet and get
        a feel for how it can benefit your own project.
      </Typo>

      <Typo level="display-lg" className="mt-[44px] font-bold">
        Get started
      </Typo>

      <Typo dim className="mt-20 italic" level="body-sm">
        Access blockchain world by your social identity
      </Typo>
      <div className="mt-8 w-[247px]">
        <div
          id="g_id_onload"
          data-client_id="895682364696-mdj2aeec301i5i996tcvd91a92vpilj5.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="handleGgLogin"
          data-auto_prompt="false"
        />
        <div
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="filled_black"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        />
      </div>

      <Typo dim className="mt-12 italic" level="body-sm">
        Pick your wallet
      </Typo>

      <Button className="mt-8 w-[247px]" label="Connect wallet" onClick={() => setOpen(true)} />
    </>
  )
}
