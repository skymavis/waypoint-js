import { connectKeyless } from "@sky-mavis/waypoint/core"
import clsx from "clsx"
import React, { FC, ReactNode, useCallback, useRef, useState } from "react"
import { createWalletClient, custom, WalletClient } from "viem"
import { saigon } from "viem/chains"

import { WalletContext } from "./wallet-context"

type Props = {
  children?: ReactNode
}

export const WalletProvider: FC<Props> = props => {
  const { children } = props

  const inputRef = useRef<HTMLInputElement>(null)

  const [walletClient, setWalletClient] = useState<WalletClient>()
  const [isOpen, setOpen] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const newWalletClient = useCallback(async (password: string) => {
    const accessToken = localStorage.getItem("accessToken")
    const expectedAddress = localStorage.getItem("address")

    if (!accessToken || !expectedAddress) {
      throw new Error("No access token found")
    }

    const provider = await connectKeyless({
      chainId: saigon.id,
      waypointToken: accessToken,
      recoveryPassword: password,
    })

    const walletClient = createWalletClient({
      transport: custom(provider),
      chain: saigon,
    })

    const walletAccounts = await walletClient.getAddresses()

    if (walletAccounts.length === 0) {
      throw new Error("No connected accounts found")
    }

    if (walletAccounts[0] !== expectedAddress) {
      throw new Error("Connected account does not match expected address")
    }

    return walletClient
  }, [])

  const requestWalletClient = useCallback(async () => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    setOpen(true)
  }, [])

  const handleUnlock = async () => {
    const password = inputRef.current?.value ?? ""

    try {
      const newClient = await newWalletClient(password)

      setWalletClient(newClient)
      setOpen(false)
    } catch (error) {
      setError("Password is incorrect")
      console.debug("🚀 | handleUnlock:", error)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <WalletContext.Provider
      value={{
        requestWalletClient,
        walletClient,
      }}
    >
      {children}

      <div
        className={clsx(
          "z-50 inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center",
          isOpen ? "fixed" : "hidden",
        )}
      >
        <div className="bg-white w-96 rounded-lg p-5">
          <h1 className="text-xl font-semibold text-slate-700">Unlock Wallet</h1>
          <p className="text-md text-slate-500 font-light">With your wallet recovery password</p>

          <input
            autoFocus
            ref={inputRef}
            className="w-full mt-4 rounded-md border-slate-400 border h-10 px-2 font-light"
            type="password"
            placeholder="Wallet's recovery password"
            defaultValue=""
          />
          {error && <p className="text-rose-600 mt-2 text-sm">{error}</p>}

          <div className="flex w-full gap-4">
            <button
              className="mt-8 w-full h-12 border-slate-200 border rounded-md text-slate-700 text-md font-semibold active:bg-slate-100"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              className="mt-8 w-full h-12 bg-sky-600 rounded-md text-white text-md font-semibold active:bg-sky-700"
              onClick={handleUnlock}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </WalletContext.Provider>
  )
}
