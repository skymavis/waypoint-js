import { Hex } from "viem"

import { request } from "../../headless-common-helper/request/request"
import { TransactionInServerFormat } from "../../headless-common-helper/transaction/common"
import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { AbortKey } from "../helper/request/abort-key"
import { BaseParams } from "./types"

export type SendParams = BaseParams & {
  tx: TransactionInServerFormat
  rpcUrl: string
}

export type SendResult = {
  tx_hash: Hex
}

export type SendApiResponse = {
  data: SendResult
}

export async function send(params: SendParams) {
  const { httpUrl, waypointToken, tx, rpcUrl } = params

  const { data, error } = await request<SendApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/rpc/send`,
    {
      headers: { authorization: waypointToken },
      key: AbortKey.send,
      body: {
        tx,
        rpc_url: rpcUrl,
      },
    },
  )

  if (data) {
    return data.data
  }

  throw new ServerError({ code: error.error_code, message: error.error_message })
}
