"use client"

import { parseRedirectUrl, redirectAuthorize } from "@sky-mavis/waypoint"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { Address, isAddress } from "viem"

import { CheckIn } from "./check-in/check-in"
import { WalletProvider } from "./wallet-context/wallet-provider"

export default function Home() {
  const [account, setAccount] = useState<Address>()
  const [error, setError] = useState<string>()

  const handleAuthorize = async () => {
    try {
      redirectAuthorize({
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
      const { accessToken, address = "" } = parseRedirectUrl()

      if (isAddress(address) && accessToken) {
        setAccount(address)

        localStorage.setItem("address", address)
        localStorage.setItem("accessToken", accessToken)
      }
    } catch (error) {
      console.debug("🚀 | parseRedirectUrl:", error)
    }
  }, [])

  return (
    <main className="flex flex-col items-start min-h-screen gap-4 p-8 md:p-24">
      <button
        className={clsx(
          "px-4 py-3 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl",
          account && "hidden",
        )}
        onClick={handleAuthorize}
      >
        Login by Ronin Waypoint
      </button>

      {account && (
        <div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">Welcome back!</div>
          <div className="mt-1 text-md font-semibold tracking-tight text-slate-500">
            Login as: {account}
          </div>
        </div>
      )}
      {error && <p className="text-rose-600 font-semibold">{error}</p>}

      <WalletProvider>{account && <CheckIn account={account} />}</WalletProvider>
    </main>
  )
}
