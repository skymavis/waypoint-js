"use client"

import { Account } from "@/components/account"
import { ReAuthorized } from "@/components/re-authorize"

import { CheckIn } from "../components/check-in"
import { useWallet } from "../hooks/use-wallet"

export default function Home() {
  const { address } = useWallet()

  return (
    <>
      <Account />

      {address && <CheckIn account={address} />}

      <ReAuthorized />
    </>
  )
}
