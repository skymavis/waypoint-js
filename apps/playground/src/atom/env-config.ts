import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

type ServiceEnvironment = "prod" | "stag"

const CLIENT_ID_MAP: Record<ServiceEnvironment, string> = {
  prod: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
  stag: "5cf4daa9-e7ff-478b-a96c-1a9d46c916ca",
} as const
const WAYPOINT_ORIGIN_MAP: Record<ServiceEnvironment, string> = {
  prod: "https://waypoint.roninchain.com",
  stag: "https://id.skymavis.one",
} as const

const _serviceEnvironmentAtom = atomWithStorage<ServiceEnvironment>(
  "SERVICE_ENVIRONMENT",
  "prod",
  undefined,
  {
    getOnInit: true,
  },
)

export const environmentConfigAtom = atom(get => {
  const env = get(_serviceEnvironmentAtom)

  const clientId = CLIENT_ID_MAP[env]
  const waypointOrigin = WAYPOINT_ORIGIN_MAP[env]

  return { clientId, waypointOrigin, env }
})

export const switchEnvironmentAtom = atom(null, async (get, set) => {
  set(_serviceEnvironmentAtom, current => {
    return current !== "prod" ? "prod" : "stag"
  })
})
