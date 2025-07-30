import { toTransactionInServerFormat } from "../../../headless-common-helper/transaction/prepare-tx"
import { createPasswordlessTracker, HeadlessPasswordlessEventName } from "../../track/track"
import { send } from "../send"
import { SendTransactionParams, SendTransactionResult } from "./types"

export const sendPaidTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { chain, transaction, waypointToken, address, httpUrl } = params
  const tracker = createPasswordlessTracker({
    event: HeadlessPasswordlessEventName.sendPaidTransaction,
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

    const { tx_hash } = await send({
      tx: txInServerFormat,
      httpUrl,
      rpcUrl: chain.rpcUrl,
      waypointToken,
    })

    tracker.trackOk({
      request: { transaction, chain },
      response: { txHash: tx_hash },
    })
    return {
      txHash: tx_hash,
    }
  } catch (error) {
    tracker.trackError(error)
    throw error
  }
}
