import { Button, Dialog, ProgressCircleLoader, TextField } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { useEffect, useState } from "react"
import {
  lockbox,
  LOCKBOX_ACCESS_TOKEN_KEY,
  lockboxConnectorImpl,
} from "src/connectors/LockboxConnector"
import { isOnClient } from "src/utils/client"

interface GoogleLoginResult {
  client_id: string
  credential: string
}

export const GgLogin = () => {
  const { activate } = useWalletgo()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGgLogin = async (result: GoogleLoginResult) => {
    const { credential } = result

    lockbox.setAccessToken(credential)
    localStorage.setItem(LOCKBOX_ACCESS_TOKEN_KEY, credential)

    setOpen(true)
  }

  const handleDecryptClientShard = async () => {
    setLoading(true)

    const backupClientShard = await lockbox.getBackupClientShard()

    const clientShard = await lockbox.decryptClientShard(backupClientShard.key, password, "")

    console.debug("🚀 | clientShard:", clientShard)

    setOpen(false)
    setLoading(false)
    activate(lockboxConnectorImpl, false)
  }

  useEffect(() => {
    if (isOnClient()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
      ;(window as any).handleGgLogin = handleGgLogin
    }
  }, [])

  return (
    <Dialog
      size="sm"
      isOpen={open}
      onClose={() => {
        setOpen(false)
      }}
      title="Unlock your wallet"
      footer={
        <Button
          fullWidth
          label="Unlock"
          onClick={handleDecryptClientShard}
          disabled={loading}
          customRightIcon={
            loading ? <ProgressCircleLoader className="ml-12" size="sm" /> : undefined
          }
        />
      }
    >
      <div className="pt-8 pb-4">
        <TextField
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value)
          }}
          placeholder="Phasephrase"
        />
      </div>
    </Dialog>
  )
}
