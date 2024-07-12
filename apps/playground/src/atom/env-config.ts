import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

type IdOrigin = "https://id.skymavis.com" | "https://id.skymavis.one"
const CLIENT_ID_MAP: Record<IdOrigin, string> = {
  ["https://id.skymavis.com"]: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
  ["https://id.skymavis.one"]: "5cf4daa9-e7ff-478b-a96c-1a9d46c916ca",
}

const _idOriginAtom = atomWithStorage<IdOrigin>("ID_ORIGIN", "https://id.skymavis.one")

export const idConfigAtom = atom(get => {
  const origin = get(_idOriginAtom)
  const clientId = CLIENT_ID_MAP[origin]

  return { origin, clientId }
})

export const switchIdConfigAtom = atom(null, async (get, set) => {
  set(_idOriginAtom, current => {
    return current !== "https://id.skymavis.com"
      ? "https://id.skymavis.com"
      : "https://id.skymavis.one"
  })
})
