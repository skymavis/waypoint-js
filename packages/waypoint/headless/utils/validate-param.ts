import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"

export const addBearerPrefix = (waypointToken: string) => {
  return waypointToken.startsWith("Bearer ") ? waypointToken : "Bearer " + waypointToken
}

// export const validateToken = (waypointToken: string | undefined) => {
//   if (!waypointToken) {
//     throw new HeadlessClientError({
//       cause: undefined,
//       code: HeadlessClientErrorCode.InvalidWaypointTokenError,
//       message: "waypointToken is NOT valid",
//     })
//   }

//   return addBearerPrefix(waypointToken)
// }
