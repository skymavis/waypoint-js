import { parseRedirectUrl, redirectAuthorize } from "@sky-mavis/mavis-id-sdk"
import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { Button } from "src/@/components/ui/button"
import { idConfigAtom } from "src/atom/env-config"
import { useWrapToast } from "src/hooks/useWrapToast"

export const RedirectAuthorize = () => {
  const { clientId, origin } = useAtomValue(idConfigAtom)
  const { toastSuccess } = useWrapToast()

  const handleRedirectAuthorize = async () => {
    redirectAuthorize({
      clientId,
      idOrigin: origin,
    })
  }

  useEffect(() => {
    try {
      const result = parseRedirectUrl()

      console.debug("🚀 | Redirect - Authorization Result:", result)
      toastSuccess("Check your console for result!")
    } catch (error) { /* empty */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Button className="mt-4 w-[247px]" onClick={handleRedirectAuthorize}>
      Login with ID | Redirect
    </Button>
  )
}
