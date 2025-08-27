import { AutoConnectPriority, BaseConnector, IConnectResult } from "@roninnetwork/walletgo"
import { HeadlessProvider, ServiceEnv } from "@sky-mavis/headless/common"
import { HeadlessV1Client } from "@sky-mavis/headless/v1"
import { delegationAuthorize } from "@sky-mavis/waypoint"

import { RoninLogo } from "./RoninLogo"

const RONIN_LOGO = <RoninLogo />
const SUB_LABEL = <span style={{ color: "#f59e0b" }}>Hybrid Flow</span>

const SHARD_KEY = "WP_SHARD"
const TOKEN_KEY = "WP_TOKEN"
const STORAGE_PREFIX = "HYBRID_CONNECTOR"

const isStorageAvailable = () => typeof window !== "undefined" && "localStorage" in window
const getStorage = (key: string) =>
  isStorageAvailable() ? localStorage.getItem(`${STORAGE_PREFIX}:${key}`) : null
const setStorage = (key: string, value: string) =>
  isStorageAvailable() ? localStorage.setItem(`${STORAGE_PREFIX}:${key}`, value) : null
const removeStorage = (key: string) =>
  isStorageAvailable() ? localStorage.removeItem(`${STORAGE_PREFIX}:${key}`) : null

export class WaypointHybridConnector extends BaseConnector<HeadlessProvider> {
  clientId: string
  waypointOrigin: string
  headlessEnv: ServiceEnv

  switchable: false
  scannable: false
  autoPriority = AutoConnectPriority.WalletConnect

  hidden = false

  provider?: HeadlessProvider

  constructor(clientId: string, waypointOrigin: string, headlessEnv: ServiceEnv) {
    super(
      "WAYPOINT_HYBRID_CONNECTOR",
      "Ronin Waypoint",
      { default: waypointOrigin, external: waypointOrigin },
      RONIN_LOGO,
      false,
      SUB_LABEL,
    )

    this.clientId = clientId
    this.waypointOrigin = waypointOrigin
    this.headlessEnv = headlessEnv
  }

  async shouldAutoConnect(): Promise<boolean> {
    return false
  }

  async connect(chainId: number): Promise<IConnectResult<HeadlessProvider>> {
    const client = HeadlessV1Client.create({
      chainId: chainId,
      serviceEnv: this.headlessEnv,
    })

    const savedWaypointToken = getStorage(TOKEN_KEY) ?? ""
    const savedClientShard = getStorage(SHARD_KEY) ?? ""

    try {
      const { address } = await client.connect({
        waypointToken: savedWaypointToken,
        clientShard: savedClientShard,
      })
      const signable = client.isSignable()

      if (!signable) {
        throw "Client is not signable"
      }

      return {
        account: address,
        chainId: chainId,
        provider: new HeadlessProvider(client.getCore()),
      }
    } catch (error) {
      /* empty */
    }

    const { clientShard, token: waypointToken } = await delegationAuthorize({
      mode: "popup",
      clientId: this.clientId,
      waypointOrigin: this.waypointOrigin,
    })
    const { address } = await client.connect({
      clientShard,
      waypointToken,
    })
    const signable = client.isSignable()

    if (!signable) {
      throw "Client is not signable"
    }

    setStorage(TOKEN_KEY, waypointToken)
    setStorage(SHARD_KEY, clientShard)

    return {
      account: address,
      chainId: chainId,
      provider: new HeadlessProvider(client.getCore()),
    }
  }

  async disconnect(): Promise<boolean> {
    removeStorage(TOKEN_KEY)
    removeStorage(SHARD_KEY)
    return true
  }

  switchChain(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
}
