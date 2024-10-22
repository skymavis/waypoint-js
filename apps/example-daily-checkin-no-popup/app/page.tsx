"use client"

import { authorize, parseRedirectUrl } from "@sky-mavis/waypoint"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { Address, isAddress } from "viem"

import { CheckIn } from "./check-in/check-in"
import { RonSvg } from "./components/ron-svg"
import { WalletProvider } from "./wallet-context/wallet-provider"

export default function Home() {
  const [account, setAccount] = useState<Address>()
  const [error, setError] = useState<string>()

  const handleAuthorize = async () => {
    try {
      authorize({
        mode: "redirect",
        clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
        scopes: ["email", "profile", "openid", "wallet"],
      })
    } catch (error) {
      console.debug("🚀 | handleAuthorize:", error)
      setAccount(undefined)
      setError("User reject to connect wallet! Check your console for future details.")
    }
  }

  useEffect(() => {
    try {
      const { token, address = "" } = parseRedirectUrl()

      if (isAddress(address) && token) {
        setAccount(address)

        localStorage.setItem("address", address)
        localStorage.setItem("token", token)
      }
    } catch (error) {
      console.debug("🚀 | parseRedirectUrl:", error)
    }
  }, [])

  return (
    <main className="flex flex-col min-h-screen w-screen max-w-sm m-auto px-4">
      <div
        className={clsx("flex-1 flex flex-col justify-center items-center", account && "hidden")}
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

      {account && (
        <div className="mt-10">
          <img src="./wallet.png" className="size-16" />
          <div className="mt-4 text-xl font-semibold">Your wallet</div>
          <div className="text-sm tracking-tight text-slate-500 truncate italic">{account}</div>

          <div className="border-t border-slate-400 mt-2" />
        </div>
      )}
      {error && <p className="text-rose-600 font-semibold">{error}</p>}

      <WalletProvider>{account && <CheckIn account={account} />}</WalletProvider>
    </main>
  )
}
