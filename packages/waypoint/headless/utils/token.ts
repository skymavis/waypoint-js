export const addBearerPrefix = (waypointToken: string) => {
  return waypointToken.startsWith("Bearer ") ? waypointToken : "Bearer " + waypointToken
}
