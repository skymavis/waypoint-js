"use client"

import { authorize, PKCEPopupAuthorizeData } from "@sky-mavis/waypoint"
import { useState } from "react"
import { Button } from "src/@/components/ui/button"

const PKCE = () => {
  const [response, setResponse] = useState<PKCEPopupAuthorizeData>()

  const handleRedirectPKCEAuth = async () => {
    const pkceData = await authorize({
      mode: "redirect",
      waypointOrigin: "https://id.skymavis.one",
      clientId: "dbe1e3ff-e145-422f-84c4-e0beb4972f69",
      redirectUrl: "http://localhost:3000/pkce/callback",
      checks: ["pkce"],
    })
    localStorage.setItem("code_verifier", pkceData.codeVerifier)
  }

  const handlePopupPKCEAuth = async () => {
    const pkceData = await authorize({
      mode: "popup",
      waypointOrigin: "https://id.skymavis.one",
      clientId: "dbe1e3ff-e145-422f-84c4-e0beb4972f69",
      redirectUrl: "http://localhost:3000/pkce/callback",
      checks: ["pkce"],
    })
    setResponse(pkceData)
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-16 gap-2">
      <Button onClick={handleRedirectPKCEAuth}>PKCE Redirect</Button>
      <Button onClick={handlePopupPKCEAuth}>PKCE Popup</Button>
      <pre>{response && JSON.stringify(response, null, 2)}</pre>
    </div>
  )
}

export default PKCE
