import { type Address } from "viem"

import { CommunicateHelper } from "../../common/communicate"
import { openPopup } from "../../common/popup"
import { GenericTransaction } from "../../common/tx"

type SendTransactionParams = {
  params: [transaction: GenericTransaction]

  chainId: number
  expectAddress: Address

  clientId: string
  waypointOrigin: string
  communicateHelper: CommunicateHelper
}

export const sendTransaction = async ({
  params,

  chainId,
  expectAddress,

  clientId,
  waypointOrigin,
  communicateHelper,
}: SendTransactionParams): Promise<string> => {
  const [transaction] = params

  const txHash = await communicateHelper.sendRequest<string>(state =>
    openPopup(`${waypointOrigin}/wallet/send`, {
      state,
      clientId,
      origin: window.location.origin,

      chainId,
      expectAddress,

      ...transaction,
    }),
  )

  return txHash
}
