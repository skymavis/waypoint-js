"use client"

import { authorize } from "@sky-mavis/waypoint"
import { useState } from "react"
import { Button } from "src/@/components/ui/button"

const SnackBar = () => {
  const [result, setResult] = useState<string | null>(null)
  const handleAuthorize = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    try {
      const data = await authorize({
        mode: "popup",
        waypointOrigin: "https://id.skymavis.one",
        clientId: "dbe1e3ff-e145-422f-84c4-e0beb4972f69",
        redirectUrl: "http://localhost:3000/pkce/callback",
        theme: "dark",
      })
      setResult(JSON.stringify(data))
    } catch (error) {
      console.log("error", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-16 gap-2">
      <Button onClick={handleAuthorize}>Authorize</Button>
      <pre>{result}</pre>
    </div>
  )
}

export default SnackBar
