import { CommunicateHelper } from "./common/communicate-helper"
import { IEip1193RequestArgs } from "./common/eip1193"
import { IUnsignedTransaction, ZERO_TX_DATA } from "./common/tx"
import { openPopup } from "./utils/popup"

export type SendTransactionParams = {
  params?: IEip1193RequestArgs["params"]
  clientId: string
  gateOrigin: string
  chainId: number
  communicateHelper: CommunicateHelper
}

export const sendTransaction = async ({
  params,
  clientId,
  gateOrigin,
  chainId,
  communicateHelper,
}: SendTransactionParams): Promise<string> => {
  const { to, value, data, gas, maxFeePerGas, maxPriorityFeePerGas } =
    params?.[0] as IUnsignedTransaction

  if (data && parseInt(data, 16) !== ZERO_TX_DATA) {
    const requestPayload: any = {
      clientId: clientId,
      origin: window.location.origin,
      to: to,
      data: data,
      chainId: chainId.toString(),
      value,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    }

    const txHash = await communicateHelper.sendRequest<string>(requestId =>
      openPopup(`${gateOrigin}/wallet/call`, {
        state: requestId,
        ...requestPayload,
      }),
    )
    return txHash
  }

  const txHash = await communicateHelper.sendRequest<string>(requestId =>
    openPopup(`${gateOrigin}/wallet/send`, {
      clientId,
      state: requestId,
      origin: window.location.origin,
      to: to,
      chainId: chainId.toString(),
      value: parseInt(value, 16).toString(),
    }),
  )
  return txHash
}
