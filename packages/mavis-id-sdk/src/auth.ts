import { jwtDecode } from "jwt-decode"

import { DecodedTokenInfo, IdAuthResponse } from "./common/auth"
import { GATE_ORIGIN_PROD } from "./common/gate"
import { CommunicateHelper } from "./core/communicate"
import { openPopup } from "./utils/popup"
import type { Requires } from "./utils/types"
import { validateIdAddress } from "./utils/validate-address"

export type MavisIdAuthOpts = {
  clientId: string
  redirectUri?: string
  gateOrigin?: string
}

export class MavisIdAuth {
  private readonly clientId: string
  private readonly gateOrigin: string
  private readonly redirectUri?: string

  private readonly communicateHelper: CommunicateHelper

  protected constructor(options: Requires<MavisIdAuthOpts, "gateOrigin">) {
    const { clientId, gateOrigin, redirectUri } = options

    this.clientId = clientId
    this.gateOrigin = gateOrigin
    this.redirectUri = redirectUri

    this.communicateHelper = new CommunicateHelper(gateOrigin)
  }

  public static create = (options: MavisIdAuthOpts) => {
    const { clientId, gateOrigin = GATE_ORIGIN_PROD } = options

    return new MavisIdAuth({
      clientId,
      gateOrigin: gateOrigin,
    })
  }

  connect = async () => {
    const { gateOrigin, clientId } = this

    const authData = await this.communicateHelper.sendRequest<IdAuthResponse>(requestId =>
      openPopup(`${gateOrigin}/client/${clientId}/authorize`, {
        state: requestId,
        redirect: this.redirectUri ?? window.location.origin,
        origin: window.location.origin,
        scope: ["openid", "profile", "email"].join(" "),
      }),
    )

    const { id_token: accessToken, address } = authData ?? {}

    const decodedInfo = jwtDecode<DecodedTokenInfo>(accessToken)
    delete decodedInfo.ronin_address

    return {
      accessToken: accessToken,
      decodedInfo,
      idAddress: validateIdAddress(address),
    }
  }
}
