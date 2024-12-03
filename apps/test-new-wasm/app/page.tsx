"use client"

import {
  decryptShard,
  encryptShard,
  getAddressFromShard,
  keygen,
  personalSign,
  sendSponsoredTransaction,
  sendTransaction,
} from "@sky-mavis/waypoint/headless"
import clsx from "clsx"
import { useState } from "react"

const WASM_URL = "/mpc.wasm"
const LOCKBOX_STAG_WS_URL = "wss://project-x.skymavis.one"

const CLIENT_SHARD =
  "eyJjaGFpbktleSI6ImFvYThudk1wV3FIK2dFS2F3QlJjYXdxWkVjVDh3TUtabTV2N2dYM3dmTVk9Iiwic2VjcmV0U2hhcmUiOiJSYi9BYW1JMzJZSTZvRU9CaXRQSTcxak9paHBONEhnYjBQbWdhYnRCNm9BPSIsInB1YmxpY1BvaW50IjoiQXlzblRDbWpTcWxBbVAvWEdFbUdqeWNMM0NuUDNGYWVGOUZ3aVFvYjVUZUEiLCJhcHBJRCI6IiJ9"
const WAYPOINT_TOKEN =
  "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiJ3YWxsZXR4IiwiaXNzIjoiZGVmYXVsdCIsInV1aWQiOiJiZW5jaC0wMTkzMDVhYWI0YmE3NmM2YWM3OTk5ZTU5ZjllZTViZCJ9.uBelr3FxaLwwg97Q275D_gHYto8Ma_mRCRvSs1vKHf9eRPqYCp7nqMY7AsQ_9bDZJSKsJsqH2QF-jiRnDmPaOA"
const RECOVERY_PASSWORD = "123123123"
const BACKUP_DATA =
  "REJESCtyN0xCeW5tb1VUVFF4QTZBaTFIMWhNUEdJVGp5UXpobVczanBGUUs4aG42QWlhTVVJR3didTZHNDZ6d2l5K2NSTlFIaWNEUlFNUzdQTE14Zm93OE1ZNCtwMW1qNXhPQldqTzY2UCtkaHNyS1JkMFpEVG5TRHJlZlVEWGN0akw3MjM3MjVsUDAxR2RGdWxEOHVvQ1l6d081SUVwSHA5enZqNlB6MCsyNkpxL0tha282TEp3b3VNSlJjUzdVVkxvSU54cFBESEo1RHhaSGVybTAxWXhldDY3b3RpRml4eitYaVIwcE1LTndrc2s5RkpiM0UvZWdCbUFmSm1QNkdKUW8vOGVvVWhWWWszKzhBS1V4Y3Ftb1pyQktwdkpQeG9pcm42UWtzM0oxTUJ6Mlc3ZENwVkIrdHZ6dEJBelpxSFJYWUxJNU5iVzRHdUdacHo5TURBcG1XQ2lTT1BjbUVCc2MxS2xYRVdxRk5CbVpFQ1lMR3hualJyUTJFQT09"

const KeygenTestPage = () => {
  const [wpToken, setWpToken] = useState(WAYPOINT_TOKEN)

  const handleKeygen = async () => {
    const start = performance.now()
    const result = await keygen({
      wasmUrl: WASM_URL,
      wsUrl: LOCKBOX_STAG_WS_URL,
      waypointToken: wpToken,
    })
    const end = performance.now()

    console.debug("handleKeygen result:", result)
    console.debug(`Execution time: ${end - start} ms`)
  }

  const handleSignMessage = async () => {
    const start = performance.now()
    const result = await personalSign({
      wasmUrl: WASM_URL,
      wsUrl: LOCKBOX_STAG_WS_URL,
      clientShard: CLIENT_SHARD,
      waypointToken: WAYPOINT_TOKEN,
      message: "Hello world",
    })
    const end = performance.now()

    console.debug("handleSignMessage result:", result)
    console.debug(`Execution time: ${end - start} ms`)
  }

  const handleGetAddress = async () => {
    const start = performance.now()
    const address = getAddressFromShard(CLIENT_SHARD)
    const end = performance.now()

    console.debug("handleGetAddress result:", address)
    console.debug(`Execution time: ${end - start} ms`)
  }

  const handleSignTx = async () => {
    const start = performance.now()
    const result = await sendTransaction({
      clientShard: CLIENT_SHARD,
      waypointToken: WAYPOINT_TOKEN,
      wasmUrl: WASM_URL,
      wsUrl: LOCKBOX_STAG_WS_URL,
    })
    const end = performance.now()

    console.debug("handleSignTx result:", result)
    console.debug(`Execution time: ${end - start} ms`)
  }

  const handleSendSponsoredTx = async () => {
    const start = performance.now()
    const result = await sendSponsoredTransaction({
      clientShard: CLIENT_SHARD,
      waypointToken: WAYPOINT_TOKEN,
      wasmUrl: WASM_URL,
      wsUrl: LOCKBOX_STAG_WS_URL,
    })
    const end = performance.now()

    console.debug("handleSendSponsoredTx result:", result)
    console.debug(`Execution time: ${end - start} ms`)
  }

  const decryptKey = async () => {
    const start = performance.now()
    const result = await decryptShard({
      waypointToken: WAYPOINT_TOKEN,
      encryptedData: BACKUP_DATA,
      recoveryPassword: RECOVERY_PASSWORD,
    })

    const end = performance.now()
    const address = getAddressFromShard(result)

    console.debug("decryptKey result:", result)
    console.debug("address:", address)
    console.debug(`Execution time: ${end - start} ms`)
  }

  const encryptKey = async () => {
    const start = performance.now()
    const result = await encryptShard({
      waypointToken: WAYPOINT_TOKEN,
      clientShard: CLIENT_SHARD,
      recoveryPassword: RECOVERY_PASSWORD,
    })

    const end = performance.now()

    console.debug("encryptKey result:", result)
    console.debug(`Execution time: ${end - start} ms`)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <textarea value={wpToken} onChange={e => setWpToken(e.target.value)} cols={30} rows={10} />

      <button
        onClick={handleKeygen}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Keygen
      </button>

      <button
        onClick={handleGetAddress}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Get address
      </button>

      <button
        onClick={handleSignMessage}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Sign message
      </button>

      <button
        onClick={handleSignTx}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Send transaction
      </button>

      <button
        onClick={handleSendSponsoredTx}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Send sponsored transaction
      </button>

      <button
        onClick={decryptKey}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Decrypt Key
      </button>
      <button
        onClick={encryptKey}
        className={clsx(
          "px-8 py-4",
          "inline-flex justify-center items-center",
          "rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
          "font-semibold text-slate-100 text-lg",
        )}
      >
        Encrypt Key
      </button>
    </div>
  )
}

export default KeygenTestPage
