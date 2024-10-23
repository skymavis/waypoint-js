"use client"

import clsx from "clsx"

import { redirectAuthorize } from "@/common/redirect-authorize"

import { RonSvg } from "../../components/ron-svg"

export default function Login() {
  return (
    <>
      <div className={clsx("flex-1 flex flex-col justify-center items-center")}>
        <img src="./planner.png" className="size-16" />
        <div className="text-xl font-semibold mt-3">Daily Check-In</div>

        <button
          className={clsx(
            "mt-16 py-2 px-6",
            "flex items-center rounded-xl",
            "bg-teal-800 bg-opacity-10 active:bg-opacity-15 hover:bg-opacity-15",
          )}
          onClick={redirectAuthorize}
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
    </>
  )
}
