import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

type WaypointOrigin = "https://waypoint.roninchain.com" | "https://id.skymavis.one"
const CLIENT_ID_MAP: Record<WaypointOrigin, string> = {
  ["https://waypoint.roninchain.com"]: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
  ["https://id.skymavis.one"]: "5cf4daa9-e7ff-478b-a96c-1a9d46c916ca",
}

const _waypointOriginAtom = atomWithStorage<WaypointOrigin>(
  "RONIN_WAYPOINT_ORIGIN",
  "https://waypoint.roninchain.com",
  undefined,
  {
    getOnInit: true,
  },
)

export const waypointConfigAtom = atom(get => {
  const origin = get(_waypointOriginAtom)
  const clientId = CLIENT_ID_MAP[origin]

  return { origin, clientId }
})

export const switchWaypointConfigAtom = atom(null, async (get, set) => {
  set(_waypointOriginAtom, current => {
    return current !== "https://waypoint.roninchain.com"
      ? "https://waypoint.roninchain.com"
      : "https://id.skymavis.one"
  })
})
