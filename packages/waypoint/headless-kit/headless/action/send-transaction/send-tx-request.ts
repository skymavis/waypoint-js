import { create, toBinary } from "@bufbuild/protobuf"

import {
  ChainParams,
  TransactionInServerFormat,
} from "../../../headless-common-helper/transaction/common"
import { jsonToBytes } from "../../../headless-common-helper/utils/convertor"
import { FrameSchema, Type } from "../../proto/rpc"
import { SignRequestSchema, SignType } from "../../proto/sign"

export const sendTransactionRequest = (
  socket: WebSocket,
  txData: TransactionInServerFormat,
  chain: ChainParams,
) => {
  const sendTransactionParams = {
    tx: txData,
    clientParams: {
      url: chain.rpcUrl,
      chainId: chain.chainId,
    },
  }
  const signRequest = create(SignRequestSchema, {
    params: jsonToBytes(sendTransactionParams),
    type: SignType.TRANSACTION,
  })
  const frame = create(FrameSchema, {
    data: toBinary(SignRequestSchema, signRequest),
    type: Type.DATA,
  })

  socket.send(toBinary(FrameSchema, frame))
}
