"use client"

import { authorize, redirectAuthorize } from "@sky-mavis/mavis-id-sdk"
import { Button } from "src/@/components/ui/button"
import { MavisLogo } from "src/connectors/MavisLogo"
import { useWalletgoDialog } from "src/hooks/useWalletgoDialog"
import { useWrapToast } from "src/hooks/useWrapToast"

export const Intro = () => {
  const { setOpen } = useWalletgoDialog()
  const { toastSuccess } = useWrapToast()

  const handleAuthorize = async () => {
    const result = await authorize({
      clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
    })

    console.debug("🚀 | Authorize result:", result)
    toastSuccess("Check your console for authorize result!")
  }

  const handleRedirectAuthorize = async () => {
    redirectAuthorize({
      clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
      redirectUrl: "https://mavis-id-playground.vercel.app",
    })
  }

  return (
    <>
      <MavisLogo width={88} />

      <div className="mt-16 text-4xl font-bold tracking-tight lg:text-5xl">Mavis ID</div>
      <div className="mt-0 italic text-sm font-medium">by Ronin</div>

      <div className="mt-12 font-semibold">Welcome to Mavis ID Demo</div>
      <div className="mt-2 max-w-[400px] text-sm font-medium italic">
        With this sample app, you can explore the various features of basic Mavis ID wallet and get
        a feel for how it can benefit your own project.
      </div>

      <div className="mt-44 font-bold text-2xl">Get started</div>

      <Button className="mt-4 w-[247px]" onClick={handleAuthorize}>
        Authorize
      </Button>

      <Button className="mt-4 w-[247px]" onClick={handleRedirectAuthorize}>
        Redirect Authorize
      </Button>

      <Button className="mt-4 w-[247px]" onClick={() => setOpen(true)}>
        Connect your wallet
      </Button>
    </>
  )
}
