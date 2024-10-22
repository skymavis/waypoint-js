"use client"

import { getKeylessProvider } from "@sky-mavis/waypoint/core"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { Address, createWalletClient, custom, WalletClient } from "viem"
import { saigon } from "viem/chains"

import { getUser } from "../common/get-user"
import { WP_ADDRESS_STORAGE_KEY, WP_TOKEN_STORAGE_KEY } from "../common/storage"
import { WalletContext } from "./wallet-context"

type Props = {
  children?: ReactNode
}

// * handle global flow
// * get users' password & unlock wallet
// * reconnect wallet
// * reauthorized user if needed
// * WHY: all application will have access to walletClient to interact with blockchain
export const WalletProvider: FC<Props> = props => {
  const { children } = props

  const { replace } = useRouter()

  const inputRef = useRef<HTMLInputElement>(null)

  const [address, setAddress] = useState<Address>()
  const [email, setEmail] = useState<string>()
  const [expiration, setExpiration] = useState<number>()

  const [walletClient, setWalletClient] = useState<WalletClient>()
  const [isOpen, setOpen] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const newWalletClient = useCallback(async (password: string) => {
    const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY)
    const expectedAddress = localStorage.getItem(WP_ADDRESS_STORAGE_KEY)

    if (!token || !expectedAddress) {
      throw new Error("No waypoint token found")
    }

    const provider = await getKeylessProvider({
      chainId: saigon.id,
      waypointToken: token,
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

  useEffect(() => {
    try {
      const { address, tokenPayload } = getUser()

      setAddress(address)
      setEmail(tokenPayload.email)
      setExpiration(tokenPayload.exp)
    } catch (error) {
      console.debug(error)
      replace("/login")
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        requestWalletClient,
        walletClient,
        address,
        email,
        expiration,
      }}
    >
      {children}

      <div
        className={clsx(
          "z-50 inset-0 bg-slate-800 bg-opacity-50 flex items-center justify-center",
          isOpen ? "fixed" : "hidden",
        )}
      >
        <div className="bg-white max-w-sm w-full rounded-2xl p-6 mb-20">
          <h1 className="text-xl font-semibold tracking-wide">Unlock Wallet</h1>
          <p className="text-sm text-slate-500 font-light">Use your wallet recovery password</p>

          <input
            autoFocus
            ref={inputRef}
            className="w-full mt-6 rounded-lg border-slate-400 border px-4 py-3 font-light"
            type="password"
            placeholder="Recovery password"
            defaultValue=""
          />
          {error && <p className="text-rose-400 mt-2 text-sm">{error}</p>}

          <div className="flex w-full gap-4 mt-6">
            <button
              className="w-full h-12 border-slate-400 border rounded-full text-slate-700 text-md font-semibold active:bg-slate-100"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              className="w-full h-12 bg-sky-600 hover:bg-sky-700 rounded-full text-white text-md font-semibold active:bg-sky-700"
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