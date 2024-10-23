"use client"

import { parseRedirectUrl } from "@sky-mavis/waypoint"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { isAddress } from "viem"

import { WP_ADDRESS_STORAGE_KEY, WP_TOKEN_STORAGE_KEY } from "@/common/storage"
import { RonSvg } from "@/components/ron-svg"

export default function Redirect() {
  const { push } = useRouter()

  useEffect(() => {
    try {
      const { token, address = "" } = parseRedirectUrl()

      if (isAddress(address) && token) {
        localStorage.setItem(WP_ADDRESS_STORAGE_KEY, address)
        localStorage.setItem(WP_TOKEN_STORAGE_KEY, token)
      }
    } catch (error) {
      console.debug(error)
    }

    push("/")
  }, [])

  return (
    <div className={clsx("flex-1 flex flex-col justify-center items-center")}>
      <img src="./planner.png" className="size-16" />
      <div className="text-xl font-semibold mt-3">Daily Check-In</div>

      <div
        className={clsx(
          "mt-16 py-2 px-6",
          "flex items-center rounded-xl",
          "bg-teal-800 bg-opacity-10",
        )}
      >
        <RonSvg className="size-10 mr-3 shrink-0" />

        <div className="flex-1 flex flex-col justify-start items-start text-left">
          <div className="font-semibold text-base truncate">Please wait a moment ...</div>
        </div>
      </div>
    </div>
  )
}
