import { Button, Typo } from "@axieinfinity/ronin-ui"
import { useWalletgo } from "@roninnetwork/walletgo"
import { ID_URL } from "src/connectors/MavisIdConnector"
import { useGlobalToast } from "src/hooks/useToast"

import { Card } from "../Card"
import { Divider } from "../Divider"

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 720
const DEFAULT_TITLE = "Confirm this transaction"

export const openPopup = (inputUrl: string, query?: Record<string, string>) => {
  if (typeof window !== "undefined" && window.top) {
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - DEFAULT_WIDTH) / 2))
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - DEFAULT_HEIGHT) / 2))

    const url = new URL(inputUrl)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        value && url.searchParams.set(key, value)
      })
    }

    const popup = window.open(
      url,
      DEFAULT_TITLE,
      `
        scrollbars=yes,
        width=${DEFAULT_WIDTH},
        height=${DEFAULT_HEIGHT},
        top=${top},
        left=${left}
      `,
    )

    if (!popup) throw new Error(`Failed to open ${DEFAULT_TITLE}`)

    popup.focus()

    return popup
  }
}

export const ViewAssets = () => {
  const { showError } = useGlobalToast()

  const { account } = useWalletgo()

  const handleViewAssets = async () => {
    if (!account) {
      showError("Please connect your wallet first!")
      return
    }

    openPopup(
      `${ID_URL}/wallet/view?clientId=xdemo&redirect=${window.location.origin}&chainId=2021`,
    )
  }

  return (
    <Card>
      <Typo level="display-sm">View Assets</Typo>
      <Typo dim className="mt-4 italic" level="body-sm">
        View assets from your current wallet.
      </Typo>

      <Button fullWidth label="View assets" onClick={handleViewAssets} className="mt-20" />

      <Divider />
    </Card>
  )
}
