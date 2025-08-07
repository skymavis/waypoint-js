import { Address } from "viem"

import { ServerError } from "../../../common/error/server"
import { request } from "../../../common/request/request"
import {
  ChainParams,
  SupportedTransaction,
  TransactionParams,
} from "../../../common/transaction/common"
import { toTransactionInServerFormat } from "../../../common/transaction/prepare-tx"
import { RawServerError } from "../../error/raw-server"

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
    type: SupportedTransaction.RoninGasSponsor,
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
