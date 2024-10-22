"use client"

import { useRouter } from "next/navigation"

import { WP_ADDRESS_STORAGE_KEY, WP_TOKEN_STORAGE_KEY } from "@/common/storage"

import { useWallet } from "../hooks/use-wallet"

export const Account = () => {
  const { replace } = useRouter()
  const { email, address } = useWallet()

  if (!address) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem(WP_TOKEN_STORAGE_KEY)
    localStorage.removeItem(WP_ADDRESS_STORAGE_KEY)
    replace("/login")
  }

  return (
    <div className="mt-10 flex flex-col">
      <img src="./wallet.png" className="size-16" />
      <div className="flex mt-4 items-baseline justify-between">
        <div className="text-xl font-semibold">Your account</div>
        <button className="text-sm font-medium italic hover:underline" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="mt-2 text-sm font-semibold truncate">{email}</div>
      <div className="text-sm tracking-tight text-slate-500 truncate italic">{address}</div>

      <div className="border-t border-slate-400 mt-2" />
    </div>
  )
}
