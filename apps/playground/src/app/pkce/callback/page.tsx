"use client"

import { parseRedirectUrl, PKCEPopupAuthorizeData } from "@sky-mavis/waypoint"
import { useEffect, useState } from "react"

const PKCECallback = () => {
  const [response, setResponse] = useState<PKCEPopupAuthorizeData>()

  useEffect(() => {
    const response = parseRedirectUrl()
    localStorage.getItem("code_verifier")

    setResponse({
      codeVerifier: localStorage.getItem("code_verifier") ?? "",
      authorizationCode: response.authorizationCode ?? "",
    })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-16">
      <pre>{response && JSON.stringify(response, null, 2)}</pre>
    </div>
  )
}

export default PKCECallback
