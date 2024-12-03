import { create, fromBinary, toBinary } from "@bufbuild/protobuf"
import { secp256k1 } from "@noble/curves/secp256k1"
import { keccak256, stringToBytes } from "viem"

import { HeadlessClientError, HeadlessClientErrorCode } from "../error/client"
import { toServerError } from "../error/server"
import {
  BackupRequestSchema,
  BackupResponseSchema,
  BackupType,
  ChallengeInfoSchema,
  CreateBackupParamsSchema,
} from "../proto/backup"
import { Frame, FrameSchema, Type } from "../proto/rpc"
import { bytesToBase64 } from "../utils/convertor"
import { encryptShard } from "./encrypt-shard"
import { getSecretFromShard } from "./get-address"
import { sendAuthenticate, toAuthenticateData } from "./helpers/authenticate"
import { createFrameQueue, openSocket } from "./helpers/open-socket"

export type BackupShardParams = {
  waypointToken: string
  clientShard: string
  recoveryPassword: string

  wsUrl: string
}

const sendBackupRequest = (socket: WebSocket) => {
  const backupRequest = create(BackupRequestSchema, {
    type: BackupType.CHALLENGE,
  })
  const frame = create(FrameSchema, {
    type: Type.DATA,
    data: toBinary(BackupRequestSchema, backupRequest),
  })

  socket.send(toBinary(FrameSchema, frame))
}

const sendEncryptedShard = (socket: WebSocket, encryptedShard: string, signature: Uint8Array) => {
  const createBackupParams = create(CreateBackupParamsSchema, {
    encryptedKey: encryptedShard,
    signResult: bytesToBase64(signature),
  })
  const backupRequest = create(BackupRequestSchema, {
    type: BackupType.CREATE,
    params: toBinary(CreateBackupParamsSchema, createBackupParams),
  })
  const frame = create(FrameSchema, {
    type: Type.DATA,
    data: toBinary(BackupRequestSchema, backupRequest),
  })

  socket.send(toBinary(FrameSchema, frame))
}

const toSignChallenge = (challengeResponseFrame: Frame) => {
  try {
    if (challengeResponseFrame.type === Type.DATA) {
      const challengeResponse = fromBinary(BackupResponseSchema, challengeResponseFrame.data)
      const { challengeString } = fromBinary(ChallengeInfoSchema, challengeResponse.result)
      const signChallenge = keccak256(stringToBytes(challengeString), "bytes")

      return signChallenge
    }

    throw toServerError(challengeResponseFrame)
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.BackupClientShardError,
      message: `Unable to get the sign challenge from the server.`,
      cause: error,
    })
  }
}

const signChallenge = (signChallenge: Uint8Array, secret: Uint8Array) => {
  try {
    const signature = secp256k1.sign(signChallenge, secret)
    return signature.toCompactRawBytes()
  } catch (error) {
    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.BackupClientShardError,
      message: `Unable to sign the challenge with the client shard.`,
      cause: error,
    })
  }
}

export const backupShard = async (params: BackupShardParams): Promise<string> => {
  const {
    waypointToken,
    clientShard,
    recoveryPassword,

    wsUrl,
  } = params

  const secret = getSecretFromShard(clientShard)
  const encryptedShard = await encryptShard({ clientShard, recoveryPassword, waypointToken })
  console.debug("🔐 BACKUP: start")

  const socket = await openSocket(`${wsUrl}/v1/public/ws/backup/keys`)
  const { waitAndDequeue } = createFrameQueue(socket)
  console.debug("🔐 BACKUP: socket is ready")

  try {
    sendAuthenticate(socket, waypointToken)
    const authFrame = await waitAndDequeue()
    const authData = toAuthenticateData(authFrame)
    console.debug("🔐 BACKUP: authenticated", authData.uuid)

    sendBackupRequest(socket)
    const challengeFrame = await waitAndDequeue()
    const challenge = toSignChallenge(challengeFrame)

    const signature = signChallenge(challenge, secret)
    sendEncryptedShard(socket, encryptedShard, signature)

    const doneFrame = await waitAndDequeue()
    if (doneFrame.type === Type.DONE) {
      console.debug("🔐 BACKUP: done")

      return encryptedShard
    }

    throw new HeadlessClientError({
      code: HeadlessClientErrorCode.BackupClientShardError,
      message: `Unable to get the backup status from the server.`,
      cause: toServerError(doneFrame),
    })
  } finally {
    socket.close()
  }
}
