import { authorize } from "@sky-mavis/waypoint"

export const redirectAuthorize = async () => {
  try {
    authorize({
      mode: "redirect",
      clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
      scopes: ["email", "profile", "openid", "wallet"],
      redirectUrl: `${window.location.origin}/redirect`,
    })
  } catch (error) {
    console.debug("🚀 | redirectAuthorize:", error)
  }
}
