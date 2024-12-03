import { create, fromBinary, toBinary } from "@bufbuild/protobuf"
import {
  createPublicClient,
  getAddress,
  type Hex,
  hexToBigInt,
  hexToNumber,
  http,
  serializeTransaction,
  toHex,
  TransactionSerializable,
} from "viem"
import { saigon } from "viem/chains"

import { FrameSchema, Type } from "../proto/rpc"
import { SendTransactionResponseSchema, SignRequestSchema, SignType } from "../proto/sign"
import { jsonToBytes } from "../utils/convertor"
import { getAddressFromShard } from "./get-address"
import { sendAuthenticate, toAuthenticateData } from "./helpers/authenticate"
import { wasmGetSignHandler } from "./helpers/get-sign-handler"
import { createFrameQueue, openSocket } from "./helpers/open-socket"
import {
  sendProtocolData,
  wasmGetProtocolData,
  wasmReceiveProtocolData,
  wasmReceiveSession,
} from "./helpers/send-round-data"
import { wasmTriggerSign } from "./helpers/trigger-sign"

const startSocketSign = (socket: WebSocket, txData: unknown) => {
  const signTxParam = {
    tx: txData,
    clientParams: {
      url: saigon.rpcUrls.default.http[0],
      chainId: saigon.id,
    },
  }
  const signRequest = create(SignRequestSchema, {
    params: jsonToBytes(signTxParam),
    type: SignType.TRANSACTION,
  })
  const requestInFrame = create(FrameSchema, {
    data: toBinary(SignRequestSchema, signRequest),
    id: 2,
    type: Type.DATA,
  })
  const requestInBuffer = toBinary(FrameSchema, requestInFrame)

  socket.send(requestInBuffer)
}

export type SendTransactionParams = {
  waypointToken: string
  clientShard: string

  wasmUrl: string
  wsUrl: string
}
export type SendTransactionResult = {
  txHash: Hex
  signature: Hex
}

export const sendTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const {
    waypointToken,
    clientShard,

    wasmUrl,
    wsUrl,
  } = params
  const address = getAddressFromShard(clientShard)

  const publicClient = createPublicClient({
    chain: saigon,
    transport: http(),
  })
  const txCount = await publicClient.getTransactionCount({
    address: address,
  })
  const txData = {
    type: "0x0",
    to: getAddress("0xcd3cf91e7f0601ab98c95dd18b4f99221bcf0b20"),
    gas: "0x5208",
    gasPrice: "0x4a817c800",
    value: "0x23af16b18000",
    input: "0x",
    nonce: toHex(txCount),
    r: "0x0",
    v: "0x0",
    s: "0x0",
    chainId: "0x7e5",
  } as const
  const viemTxData: TransactionSerializable = {
    type: "legacy",
    to: txData.to,
    gas: hexToBigInt(txData.gas),
    gasPrice: hexToBigInt(txData.gasPrice),
    value: hexToBigInt(txData.value),
    data: txData.input,
    nonce: hexToNumber(txData.nonce),
    chainId: hexToNumber(txData.chainId),
  }
  const serializedTx = serializeTransaction(viemTxData)
  console.debug("🔏 SEND TX: start")

  const signHandler = await wasmGetSignHandler(wasmUrl)
  console.debug("🔏 SEND TX: wasm is ready")
  const socket = await openSocket(`${wsUrl}/v1/public/ws/send`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔏 SEND TX: socket is ready")

  sendAuthenticate(socket, waypointToken)
  const authFrame = await waitAndDequeue()
  const authData = toAuthenticateData(authFrame)
  console.debug("🔏 SEND TX: authenticated", authData.uuid)

  const signResultPromise = wasmTriggerSign(signHandler, serializedTx, clientShard)
  console.debug("🔏 SEND TX: trigger wasm sign")

  startSocketSign(socket, txData)
  console.debug("🔏 SEND TX: trigger socket sign")
  const sessionFrame = await waitAndDequeue()
  wasmReceiveSession(signHandler, sessionFrame)

  const socketR1 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR1)
  console.debug("🔏 SIGN: socket - round 1")

  const wasmR1 = await wasmGetProtocolData(signHandler)
  sendProtocolData(socket, wasmR1)
  console.debug("🔏 SIGN: wasm - round 1")

  const socketR2 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR2)
  console.debug("🔏 SIGN: socket - round 2")

  const wasmR2 = await wasmGetProtocolData(signHandler)
  sendProtocolData(socket, wasmR2)
  console.debug("🔏 SIGN: wasm - round 2")

  const socketR3 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR3)
  console.debug("🔏 SIGN: socket - round 3")

  const sessionR2Frame = await waitAndDequeue()
  wasmReceiveSession(signHandler, sessionR2Frame)

  const socketR4 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR4)
  console.debug("🔏 SIGN: socket - round 4")

  const wasmR3 = await wasmGetProtocolData(signHandler)
  sendProtocolData(socket, wasmR3)
  console.debug("🔏 SIGN: wasm - round 3")

  const socketR5 = await waitAndDequeue()
  wasmReceiveProtocolData(signHandler, socketR5)
  console.debug("🔏 SIGN: socket - round 5")

  const transactionFrame = await waitAndDequeue()
  const transaction = fromBinary(SendTransactionResponseSchema, transactionFrame.data)

  const signature = await signResultPromise

  console.debug("🔏 SEND TX: success")
  return {
    txHash: transaction.txHash as Hex,
    signature,
  }
}
