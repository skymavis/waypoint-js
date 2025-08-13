import { isHeadlessV2Prod } from "../../common"
import { createTracker, HeadlessEventName } from "../../common/track/track"
import { toTransactionInServerFormat } from "../../common/transaction/prepare-tx"
import { sendTransactionApi } from "../api/send"
import { SendTransactionParams, SendTransactionResult } from "../types"

export const sendSponsoredTransactionAction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { chain, transaction, waypointToken, httpUrl, address } = params
  const tracker = createTracker({
    event: HeadlessEventName.sendSponsoredTransactionByHeadlessV2,
    waypointToken: params.waypointToken,
    passwordlessServiceUrl: params.httpUrl,
    isProdEnv: isHeadlessV2Prod(params.httpUrl),
  })

  try {
    const txInServerFormat = await toTransactionInServerFormat({
      chain,
      transaction,
      currentAddress: address,
    })
    const result = await sendTransactionApi({
      tx: txInServerFormat,
      httpUrl,
      rpcUrl: chain.rpcUrl,
      waypointToken,
    })
    tracker.trackOk({
      request: { transaction, chain },
      response: { txHash: result.tx_hash },
    })
    return {
      txHash: result.tx_hash,
    }
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
