import { authorize } from "@sky-mavis/waypoint"
import { useAtomValue } from "jotai"
import { Button } from "src/@/components/ui/button"
import { waypointConfigAtom } from "src/atom/env-config"
import { useWrapToast } from "src/hooks/useWrapToast"

export const Authorize = () => {
  const { clientId, origin } = useAtomValue(waypointConfigAtom)
  const { toastSuccess } = useWrapToast()

  const handleAuthorize = async () => {
    const result = await authorize({
      mode: "popup",
      clientId,
      waypointOrigin: origin,
    })

    console.debug("🚀 | Authorization Result:", result)
    toastSuccess("Check your console for result!")
  }

  return (
    <Button className="mt-4 w-[247px]" onClick={handleAuthorize}>
      Login with Ronin Waypoint
    </Button>
  )
}
