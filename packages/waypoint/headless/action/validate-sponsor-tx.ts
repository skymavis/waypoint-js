import { Address } from "viem"

import { RawServerError } from "../error/raw-server"
import { ServerError } from "../error/server"
import { request } from "./helpers/request/request"
import { ChainParams, RONIN_GAS_SPONSOR_TYPE, TransactionParams } from "./send-transaction/common"
import { toTransactionInServerFormat } from "./send-transaction/prepare-tx"

type ValidateSponsorTransactionApiResponse = {
  data: ValidateSponsorTransactionResult
}

export type ValidateSponsorTransactionParams = {
  httpUrl: string
  waypointToken: string
  transaction: TransactionParams
  chain: ChainParams
  currentAddress?: Address
}
export type ValidateSponsorTransactionResult = {
  payer: {
    address: string
  }
  hasSponsorQuotaApplied: boolean
  sponsorQuota?: number
}

export const validateSponsorTransaction = async (params: ValidateSponsorTransactionParams) => {
  const { httpUrl, waypointToken, transaction, chain, currentAddress } = params

  const sponsoredTx = {
    ...transaction,
    type: RONIN_GAS_SPONSOR_TYPE,
  } as const
  const serverTxData = await toTransactionInServerFormat({
    chain,
    transaction: sponsoredTx,
    currentAddress,
  })

  const { data, error } = await request<ValidateSponsorTransactionApiResponse, RawServerError>(
    `post ${httpUrl}/v1/public/tx-sponsor/validate`,
    {
      headers: { authorization: waypointToken },
      body: { tx: serverTxData },
    },
  )

  if (data) {
    return data.data
  }

  throw new ServerError({ code: error.code, message: error.errorMessage })
}
