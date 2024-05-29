import { type Address, type Hex, isHex } from "viem"

import { GenericTransaction } from "../common/tx"
import { openPopup } from "../utils/popup"
import { CommunicateHelper } from "./communicate"

export type SendTransactionParams = {
  params: [transaction: GenericTransaction]

  chainId: number
  expectAddress: Address

  clientId: string
  gateOrigin: string
  communicateHelper: CommunicateHelper
}

const isContractInteract = (data: Hex | undefined) =>
  data !== undefined && isHex(data) && data !== "0x"

export const sendTransaction = async ({
  params,

  chainId,
  expectAddress,

  clientId,
  gateOrigin,
  communicateHelper,
}: SendTransactionParams): Promise<string> => {
  const [transaction] = params
  const { data = transaction.input } = transaction

  if (isContractInteract(data)) {
    const txHash = await communicateHelper.sendRequest<string>(requestId =>
      openPopup(`${gateOrigin}/wallet/call`, {
        clientId,
        state: requestId,
        origin: window.location.origin,

        expectAddress,
        chainId,

        ...transaction,
      }),
    )
    return txHash
  }

  const txHash = await communicateHelper.sendRequest<string>(requestId =>
    openPopup(`${gateOrigin}/wallet/send`, {
      clientId,
      state: requestId,
      origin: window.location.origin,

      expectAddress,
      chainId,

      ...transaction,
    }),
  )

  return txHash
}
