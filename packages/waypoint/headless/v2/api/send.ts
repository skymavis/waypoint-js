import { Hash } from "viem"

import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { TransactionInServerFormat } from "../../common/transaction/common"
import { BaseParams, RawServerError } from "../types"

export type SendTransactionParams = BaseParams & {
  tx: TransactionInServerFormat
  rpcUrl: string
}

export type SendTransactionApiResponse = {
  tx_hash: Hash
}

export const sendTransactionApi = async (params: SendTransactionParams) => {
  const { httpUrl, waypointToken, tx, rpcUrl } = params

  const { data, error } = await request<SendTransactionApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/send`,
    {
      headers: { authorization: waypointToken },
      body: {
        tx,
        rpc_url: rpcUrl,
      },
    },
  )

  if (data) {
    return data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
