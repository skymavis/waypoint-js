import { fromBinary } from "@bufbuild/protobuf"
import { Hex, isHash } from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../../error/client"
import { toServerError } from "../../error/server"
import { Frame, Type } from "../../proto/rpc"
import { SendTransactionResponseSchema } from "../../proto/sign"

export const toTxHash = (sendTxResponseFrame: Frame): Hex => {
  try {
    if (sendTxResponseFrame.type === Type.DATA) {
      const { txHash } = fromBinary(SendTransactionResponseSchema, sendTxResponseFrame.data)

      if (!isHash(txHash)) {
        throw "Invalid transaction hash"
      }

      return txHash
    }

    throw toServerError(sendTxResponseFrame)
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.SendTransactionError,
      message: `Unable to get the transaction hash from the server.`,
      cause: error,
    })
  }
}
