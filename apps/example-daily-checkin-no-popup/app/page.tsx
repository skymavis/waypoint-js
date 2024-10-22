"use client"

import { authorize } from "@sky-mavis/waypoint"
import clsx from "clsx"

import { CheckIn } from "../components/check-in"
import { RonSvg } from "../components/ron-svg"
import { useWallet } from "../hooks/use-wallet"

export default function Home() {
  const { address } = useWallet()

  const handleAuthorize = async () => {
    try {
      authorize({
        mode: "redirect",
        clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
        scopes: ["email", "profile", "openid", "wallet"],
      })
    } catch (error) {
      console.debug("🚀 | handleAuthorize:", error)
    }
  }

  // useEffect(() => {
  //   try {
  //     const { token, address = "" } = parseRedirectUrl()

  //     if (isAddress(address) && token) {
  //       setAccount(address)

  //       localStorage.setItem(WP_ADDRESS_STORAGE_KEY, address)
  //       localStorage.setItem(WP_TOKEN_STORAGE_KEY, token)
  //     }
  //   } catch (error) {
  //     console.debug("🚀 | parseRedirectUrl:", error)
  //   }
  // }, [])

  return (
    <>
      <div
        className={clsx("flex-1 flex flex-col justify-center items-center", address && "hidden")}
      >
        <img src="./planner.png" className="size-16" />
        <div className="text-xl font-semibold mt-3">Daily Check-In</div>

        <button
          className={clsx(
            "mt-16 py-2 px-6",
            "flex items-center rounded-xl",
            "bg-teal-800 bg-opacity-10 active:bg-opacity-15 hover:bg-opacity-15",
          )}
          onClick={handleAuthorize}
        >
          <RonSvg className="size-10 mr-3 shrink-0" />

          <div className="flex-1 flex flex-col justify-start items-start text-left">
            <div className="font-semibold text-base truncate">Ronin Waypoint</div>
            <div className="text-sm text-slate-500 truncate">
              Connect the wallet with your email
            </div>
          </div>
        </button>
      </div>

      {address && (
        <div className="mt-10">
          <img src="./wallet.png" className="size-16" />
          <div className="mt-4 text-xl font-semibold">Your wallet</div>
          <div className="text-sm tracking-tight text-slate-500 truncate italic">{address}</div>

          <div className="border-t border-slate-400 mt-2" />
        </div>
      )}

      {address && <CheckIn account={address} />}
    </>
  )
}
