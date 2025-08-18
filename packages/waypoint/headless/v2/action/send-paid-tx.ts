import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { toTransactionInServerFormat } from "../../common/transaction/prepare-tx"
import { sendTransactionApi } from "../api/send"
import { SendTransactionParams, SendTransactionResult } from "../types"

export const sendPaidTransactionAction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { chain, transaction, waypointToken, address, httpUrl, enableTracking = true } = params
  const tracker = enableTracking
    ? createTracker({
        event: HeadlessEventName.sendPaidTransactionByHeadlessV2,
        waypointToken: params.waypointToken,
        passwordlessServiceUrl: params.httpUrl,
        isProdEnv: isHeadlessV2Prod(params.httpUrl),
      })
    : null

  try {
    const txInServerFormat = await toTransactionInServerFormat({
      chain,
      transaction,
      currentAddress: address,
    })

    const { tx_hash } = await sendTransactionApi({
      tx: txInServerFormat,
      httpUrl,
      rpcUrl: chain.rpcUrl,
      waypointToken,
    })

    tracker?.trackOk({
      request: { transaction, chain },
      response: { txHash: tx_hash },
    })
    return {
      txHash: tx_hash,
    }
  } catch (error) {
    tracker?.trackError(error)
    throw error
  }
}
