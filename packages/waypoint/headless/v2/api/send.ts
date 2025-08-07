import { Hash } from "viem"

import { ServerError } from "../../common"
import { request } from "../../common/request/request"
import { TransactionInServerFormat } from "../../common/transaction/common"
import { RawServerError } from "../error/raw-server"
import { BaseParams } from "./types"

export type SendParams = BaseParams & {
  tx: TransactionInServerFormat
  rpcUrl: string
}

export type SendApiResponse = {
  tx_hash: Hash
}

export const sendApi = async (params: SendParams) => {
  const { httpUrl, waypointToken, tx, rpcUrl } = params

  const { data, error } = await request<SendApiResponse, RawServerError>(
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
