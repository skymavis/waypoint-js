import { authorize } from "@sky-mavis/mavis-id-sdk"
import { useAtomValue } from "jotai"
import { Button } from "src/@/components/ui/button"
import { idConfigAtom } from "src/atom/env-config"
import { useWrapToast } from "src/hooks/useWrapToast"

export const Authorize = () => {
  const { clientId, origin } = useAtomValue(idConfigAtom)
  const { toastSuccess } = useWrapToast()

  const handleAuthorize = async () => {
    const result = await authorize({
      clientId,
      idOrigin: origin,
    })

    console.debug("🚀 | Authorization Result:", result)
    toastSuccess("Check your console for result!")
  }

  return (
    <Button className="mt-4 w-[247px]" onClick={handleAuthorize}>
      Login with ID
    </Button>
  )
}
