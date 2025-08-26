import { fromBinary } from "@bufbuild/protobuf"
import { Hex, isHash } from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../../common/error/client"
import { decodeServerError } from "../../error/server"
import { Frame, Type } from "../../proto/rpc"
import { SendTransactionResponseSchema } from "../../proto/sign"

export const toTxHash = (sendTxResponseFrame: Frame): Hex => {
  if (sendTxResponseFrame.type !== Type.DATA) throw decodeServerError(sendTxResponseFrame)

  try {
    const { txHash } = fromBinary(SendTransactionResponseSchema, sendTxResponseFrame.data)

    if (!isHash(txHash)) {
      throw "Invalid transaction hash"
    }
    return txHash
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SendTransactionError,
      message: `Unable to decode frame data received from the server. The data should be in a transaction hash schema.`,
      cause: error,
    })
  }
}
