import { HeadlessProvider } from "@sky-mavis/waypoint/headless/common"
import { HeadlessV1Client } from "@sky-mavis/waypoint/headless/v1"
import { createWalletClient, custom, getAddress, isAddressEqual } from "viem"

import { saigon } from "./chain"
import { WP_ADDRESS_STORAGE_KEY, WP_SHARD_STORAGE_KEY, WP_TOKEN_STORAGE_KEY } from "./storage"

export const headlessClient = HeadlessV1Client.create({ chainId: saigon.id })

export const connectHeadless = async (password: string) => {
  const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY)
  const expectedAddress = localStorage.getItem(WP_ADDRESS_STORAGE_KEY)

  if (!token || !expectedAddress) {
    throw new Error("No waypoint token found")
  }

  const { address, clientShard } = await headlessClient.connectWithPassword({
    waypointToken: token,
    recoveryPassword: password,
  })

  if (!isAddressEqual(address, getAddress(expectedAddress))) {
    throw new Error("Connected account does not match expected address")
  }

  const walletClient = createWalletClient({
    transport: custom(new HeadlessProvider(headlessClient.getCore())),
    chain: saigon,
  })

  localStorage.setItem(WP_SHARD_STORAGE_KEY, clientShard)
  return walletClient
}

export const reconnectHeadless = async () => {
  const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY)
  const clientShard = localStorage.getItem(WP_SHARD_STORAGE_KEY)
  const expectedAddress = localStorage.getItem(WP_ADDRESS_STORAGE_KEY)

  if (!token || !expectedAddress || !clientShard) {
    throw new Error("No waypoint token found")
  }

  const { address } = await headlessClient.connect({
    waypointToken: token,
    clientShard,
  })

  if (!isAddressEqual(address, getAddress(expectedAddress))) {
    throw new Error("Connected account does not match expected address")
  }

  const walletClient = createWalletClient({
    transport: custom(new HeadlessProvider(headlessClient.getCore())),
    chain: saigon,
  })

  return walletClient
}
