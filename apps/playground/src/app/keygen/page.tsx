"use client"

import { genMpc as coreKeygen, signMessage as coreSign } from "@axieinfinity/lockbox"
import { Button, TextArea, Typo } from "@axieinfinity/ronin-ui"
import { useEffect, useState } from "react"
import { LOCKBOX_ACCESS_TOKEN_KEY } from "src/connectors/LockboxConnector"
import { isOnClient } from "src/utils/client"

export const LOCKBOX_DEV_HTTP_URL = "https://project-x.skymavis.one"
export const LOCKBOX_DEV_WS_URL = "wss://project-x.skymavis.one"

interface GoogleLoginResult {
  client_id: string
  credential: string
}

const WASM_URL = "http://localhost:9999/mpc.wasm"

const KeygenTestPage = () => {
  const [accessToken, setAccessToken] = useState<string>("")

  const handleGgLogin = async (result: GoogleLoginResult) => {
    const { credential } = result
    console.debug("🚀 | credential:", credential)

    localStorage.setItem(LOCKBOX_ACCESS_TOKEN_KEY, credential)
  }

  const keygen = async () => {
    const key = await coreKeygen({
      wasmUrl: WASM_URL,
      wsUrl: LOCKBOX_DEV_WS_URL,
      accessToken: accessToken,
    })

    console.debug("🚀 | key:", key)
  }

  const sign = async () => {
    const signResult = await coreSign({
      wasmUrl: WASM_URL,
      wsUrl: LOCKBOX_DEV_WS_URL,
    })

    console.debug("🚀 | signResult:", signResult)
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

      <TextArea
        value={accessToken}
        onChange={e => setAccessToken(e.target.value)}
        cols={60}
        rows={6}
      />

      <Button label="keygen" onClick={keygen} />
      <Button label="sign" onClick={sign} />
    </div>
  )
}

export default KeygenTestPage
