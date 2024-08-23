"use client"

import { useEffect, useState } from "react"
import { Address } from "viem"

import { CheckIn } from "./check-in/check-in"
import { web3WalletClient } from "./web3-client"

export default function Home() {
  const [account, setAccount] = useState<Address>()
  const [error, setError] = useState<string>()

  const handleConnectWallet = async () => {
    try {
      const newAccounts = await web3WalletClient.requestAddresses()

      if (newAccounts.length) {
        setAccount(newAccounts[0])
        setError(undefined)
        return
      }

      setError("Could not get account from wallet! Check your console for future details.")
    } catch (error) {
      console.log(error)
      setAccount(undefined)
      setError("User reject to connect wallet! Check your console for future details.")
    }
  }

  useEffect(() => {
    const reconnectWallet = async () => {
      try {
        const connectedAccounts = await web3WalletClient.getAddresses()

        if (connectedAccounts.length) {
          setAccount(connectedAccounts[0])
          setError(undefined)
          return
        }
      } catch (error) {
        /* empty */
      }
    }

    reconnectWallet()
  }, [])

  return (
    <main className="flex flex-col items-start min-h-screen gap-4 p-24">
      <button
        className="px-4 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
        onClick={handleConnectWallet}
      >
        Login by Ronin Waypoint
      </button>

      {account && (
        <div>
          <div className="mt-2 text-lg font-semibold text-gray-800">Welcome back!</div>
          <div className="mt-1 text-sm font-semibold tracking-tight text-gray-600">
            Login as: {account}
          </div>
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}

      {account && <CheckIn account={account} />}
    </main>
  )
}
