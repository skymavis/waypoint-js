"use client"

import { Lockbox, WASM_DEV_CDN_URL } from "@axieinfinity/lockbox"
import { Button, Typo } from "@axieinfinity/ronin-ui"
import { useEffect } from "react"
import { LOCKBOX_ACCESS_TOKEN_KEY } from "src/connectors/LockboxConnector"
import { isOnClient } from "src/utils/client"

interface GoogleLoginResult {
  client_id: string
  credential: string
}

const lockbox = Lockbox.init({
  chainId: 2021,
  accessToken: undefined,
  serviceEnv: "stag",
  wasmUrl: WASM_DEV_CDN_URL,
})

const LockboxPage = () => {
  const getAddressFromClientShard = async () => {
    const address = await lockbox.getAddressFromClientShard()
    console.debug("🚀 | getAddressFromClientShard:", address)
  }

  const getUserProfile = async () => {
    const profile = await lockbox.getUserProfile()

    console.debug("🚀 | getUserProfile:", profile)
  }

  const resetLockbox = async () => {
    const { key: newClientShard } = await lockbox.resetMpc()
    console.debug("🚀 | newClientShard:", newClientShard)

    const encryptedShard = await lockbox.encryptClientShard("FARM-doum6melt")
    const result = await lockbox.backupClientShard(encryptedShard.encryptedKey)
    console.debug("🚀 | encryptedShard:", result)
  }

  const encryptClientShard = async () => {
    const encryptClientShard = await lockbox.encryptClientShard("FARM-doum6melt", 8)

    console.debug("🚀 | encryptClientShard:", encryptClientShard)
  }

  const handleGgLogin = async (result: GoogleLoginResult) => {
    const { credential } = result

    localStorage.setItem(LOCKBOX_ACCESS_TOKEN_KEY, credential)

    lockbox.setAccessToken(credential)

    const backupClientShard = await lockbox.getBackupClientShard()

    const clientShard = await lockbox.decryptClientShard(
      backupClientShard.key,
      "FARM-doum6melt",
      "famine outrun withheld goner harebell host flunky dragnet",
    )

    console.debug("🚀 | handleGgLogin:", clientShard)
  }

  const payerInfo = async () => {
    const getPayerAccessToken = await lockbox.getPayerAccessToken()
    console.debug("🚀 | getPayerAccessToken:", getPayerAccessToken)

    const payerInfo = await lockbox.getPayerInfo()
    console.debug("🚀 | payerInfo:", payerInfo)

    const sponrsorTxs = await lockbox.getSponsoredTxs()
    console.debug("🚀 | sponrsorTxs:", sponrsorTxs)
  }

  useEffect(() => {
    if (isOnClient()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
      ;(window as any).handleGgLogin = handleGgLogin
    }
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-20">
      <Typo level="display-sm">Log in</Typo>
      <Typo dim level="body-sm" className="mt-4 italic">
        Please log in with your socical account to use your wallet.
      </Typo>

      <div className="mt-20 w-[247px]">
        <div
          id="g_id_onload"
          data-client_id="895682364696-mdj2aeec301i5i996tcvd91a92vpilj5.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="handleGgLogin"
          data-auto_prompt="false"
        />
        <div
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="filled_black"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        />
      </div>

      <Button label="getAddressFromClientShard" onClick={getAddressFromClientShard} />
      <Button label="getUserProfile" onClick={getUserProfile} />
      <Button label="resetLockbox" onClick={resetLockbox} />
      <Button label="encryptClientShard" onClick={encryptClientShard} />

      <Button label="payerInfo" onClick={payerInfo} />
    </div>
  )
}

export default LockboxPage
