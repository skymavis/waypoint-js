import { AutoConnectPriority, BaseConnector, IConnectResult } from "@roninnetwork/walletgo"
import { delegationAuthorize } from "@sky-mavis/waypoint"
import { BaseProvider, BaseProviderType, HeadlessClient } from "@sky-mavis/waypoint/headless"
import { ServiceEnv } from "@sky-mavis/waypoint/headless/utils/service-url"

import { RoninLogo } from "./RoninLogo"

const RONIN_LOGO = <RoninLogo />
const SUB_LABEL = <span style={{ color: "#f59e0b" }}>Hybrid Flow</span>
const TOKEN_KEY = "WP_TOKEN"
const STORAGE_PREFIX = "HYBRID_CONNECTOR"

const isStorageAvailable = () => typeof window !== "undefined" && "localStorage" in window
const getStorage = (key: string) =>
  isStorageAvailable() ? localStorage.getItem(`${STORAGE_PREFIX}:${key}`) : null
const setStorage = (key: string, value: string) =>
  isStorageAvailable() ? localStorage.setItem(`${STORAGE_PREFIX}:${key}`, value) : null
const removeStorage = (key: string) =>
  isStorageAvailable() ? localStorage.removeItem(`${STORAGE_PREFIX}:${key}`) : null

export class WaypointHybridConnector extends BaseConnector<BaseProviderType> {
  clientId: string
  waypointOrigin: string
  headlessEnv: ServiceEnv

  switchable: false
  scannable: false
  autoPriority = AutoConnectPriority.WalletConnect

  hidden = false

  provider?: BaseProvider

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
    const savedWaypointToken = getStorage(TOKEN_KEY)

    return !!savedWaypointToken
  }

  async connect(chainId: number): Promise<IConnectResult<BaseProviderType>> {
    const baseHeadlessClient = HeadlessClient.create({
      chainId: chainId,
      serviceEnv: this.headlessEnv,
    })

    const savedWaypointToken = getStorage(TOKEN_KEY) ?? ""
    try {
      const { address, provider } = await baseHeadlessClient.reconnect({
        waypointToken: savedWaypointToken,
      })

      return {
        account: address,
        chainId: chainId,
        provider: provider,
      }
    } catch (error) {
      /* empty */
    }

    const { clientShard, token: waypointToken } = await delegationAuthorize({
      mode: "popup",
      clientId: this.clientId,
      waypointOrigin: this.waypointOrigin,
      scopes: ["email", "openid", "profile", "wallet"],
    })
    const { address, provider } = await baseHeadlessClient.connectWithShard({
      clientShard,
      waypointToken,
    })

    setStorage(TOKEN_KEY, waypointToken)
    return {
      account: address,
      chainId: chainId,
      provider: provider,
    }
  }

  async disconnect(): Promise<boolean> {
    removeStorage(TOKEN_KEY)
    return true
  }

  switchChain(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
}
