"use client"

import clsx from "clsx"

import { redirectAuthorize } from "@/common/redirect-authorize"

import { useWallet } from "../hooks/use-wallet"

export const ReAuthorized = () => {
  const { expiration, requestWalletClient } = useWallet()

  if (!expiration) {
    return null
  }

  return (
    <div
      className={clsx(
        "fixed z-40 inset-x-0 bottom-0",
        "flex flex-col justify-center items-center",
        "bg-amber-500 bg-opacity-80",
        "px-4 py-2 space-y-1",
      )}
    >
      <div className="text-sm max-w-sm w-full text-center">
        Your session end on {new Date(expiration * 1000).toString()}
      </div>
      <div className="text-sm max-w-sm w-full text-center">
        <span className="underline font-semibold cursor-pointer" onClick={requestWalletClient}>
          Re-authorize
        </span>
        &nbsp;for smooth experience
      </div>
    </div>
  )
}
