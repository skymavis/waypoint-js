import { createHeadlessClient } from "@sky-mavis/waypoint/headless"
import { createWalletClient, custom, getAddress, isAddressEqual } from "viem"
import { saigon } from "viem/chains"

import { WP_ADDRESS_STORAGE_KEY, WP_TOKEN_STORAGE_KEY } from "./storage"

const headlessClient = createHeadlessClient({})

export const connectHeadless = async (password: string) => {
  const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY)
  const expectedAddress = localStorage.getItem(WP_ADDRESS_STORAGE_KEY)

  if (!token || !expectedAddress) {
    throw new Error("No waypoint token found")
  }

  const { provider, address } = await headlessClient.connect({
    chainId: saigon.id,
    waypointToken: token,
    recoveryPassword: password,
  })

  if (!isAddressEqual(address, getAddress(expectedAddress))) {
    throw new Error("Connected account does not match expected address")
  }

  const walletClient = createWalletClient({
    transport: custom(provider),
    chain: saigon,
  })

  return walletClient
}

export const reconnectHeadless = async () => {
  const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY)
  const expectedAddress = localStorage.getItem(WP_ADDRESS_STORAGE_KEY)

  if (!token || !expectedAddress) {
    throw new Error("No waypoint token found")
  }

  const { provider, address } = await headlessClient.reconnect({
    chainId: saigon.id,
    waypointToken: token,
  })

  if (!isAddressEqual(address, getAddress(expectedAddress))) {
    throw new Error("Connected account does not match expected address")
  }

  const walletClient = createWalletClient({
    transport: custom(provider),
    chain: saigon,
  })

  return walletClient
}
