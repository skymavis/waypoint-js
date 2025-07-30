import { toTransactionInServerFormat } from "../../../headless-common-helper/transaction/prepare-tx"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../../track/track"
import { send } from "../send"
import { SendTransactionParams, SendTransactionResult } from "./types"

export const sendSponsoredTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { chain, transaction, waypointToken, httpUrl, address } = params
  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.sendSponsoredTransaction,
    waypointToken: params.waypointToken,
    passwordlessServiceUrl: params.httpUrl,
    productionFactor: params.httpUrl,
  })

  try {
    const txInServerFormat = await toTransactionInServerFormat({
      chain,
      transaction,
      currentAddress: address,
    })
    const result = await send({
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
