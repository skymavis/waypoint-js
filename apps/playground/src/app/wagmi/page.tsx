"use client"
import { connect, disconnect, signMessage } from "@wagmi/core"
import { Button } from "src/@/components/ui/button"

import { config, mavisIdWagmiConnector } from "./_config"

const RootPage = () => {
  const handleConnect = async () => {
    const result = await connect(config, { connector: mavisIdWagmiConnector })
    console.log("result", result)
  }

  const handleDisconnect = async () => {
    const result = await disconnect(config)
    console.log("result", result)
  }

  const handleSignMessage = async () => {
    const result = await signMessage(config, { message: "hello world" })
    console.log("result", result)
  }

  return (
    <div>
      <h1>Wagmi Connectors</h1>
      <p>Check your console to see result.</p>
      <div className="flex gap-2">
        <Button onClick={handleConnect}>Connect</Button>
        <Button onClick={handleDisconnect}>Disconnect</Button>
        <Button onClick={handleSignMessage}>Sign Message</Button>
      </div>
    </div>
  )
}

export default RootPage
