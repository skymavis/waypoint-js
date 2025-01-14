// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file rpc/proto/v1/backup.proto (package rpc.proto.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file rpc/proto/v1/backup.proto.
 */
export const file_rpc_proto_v1_backup: GenFile = /*@__PURE__*/
  fileDesc("ChlycGMvcHJvdG8vdjEvYmFja3VwLnByb3RvEgxycGMucHJvdG8udjEiRwoNQmFja3VwUmVxdWVzdBImCgR0eXBlGAEgASgOMhgucnBjLnByb3RvLnYxLkJhY2t1cFR5cGUSDgoGcGFyYW1zGAIgASgMIkgKDkJhY2t1cFJlc3BvbnNlEiYKBHR5cGUYASABKA4yGC5ycGMucHJvdG8udjEuQmFja3VwVHlwZRIOCgZyZXN1bHQYAiABKAwicAoNQ2hhbGxlbmdlSW5mbxIMCgR1dWlkGAEgASgJEhgKEGNoYWxsZW5nZV9zdHJpbmcYAiABKAkSEgoKY3JlYXRlZF9hdBgDIAEoAxIMCgRraW5kGAQgASgJEhUKDXRhcmdldF9vYmplY3QYBSABKAwiQAoSQ3JlYXRlQmFja3VwUGFyYW1zEhUKDWVuY3J5cHRlZF9rZXkYASABKAkSEwoLc2lnbl9yZXN1bHQYAiABKAkqXAoKQmFja3VwVHlwZRIbChdCQUNLVVBfVFlQRV9VTlNQRUNJRklFRBAAEhkKFUJBQ0tVUF9UWVBFX0NIQUxMRU5HRRABEhYKEkJBQ0tVUF9UWVBFX0NSRUFURRACQj1aO2dpdGh1Yi5jb20vYXhpZWluZmluaXR5L3gtc2VydmljZS9nZW4vZ28vcnBjL3Byb3RvL3YxO3JwY3YxYgZwcm90bzM");

/**
 * @generated from message rpc.proto.v1.BackupRequest
 */
export type BackupRequest = Message<"rpc.proto.v1.BackupRequest"> & {
  /**
   * @generated from field: rpc.proto.v1.BackupType type = 1;
   */
  type: BackupType;

  /**
   * @generated from field: bytes params = 2;
   */
  params: Uint8Array;
};

/**
 * Describes the message rpc.proto.v1.BackupRequest.
 * Use `create(BackupRequestSchema)` to create a new message.
 */
export const BackupRequestSchema: GenMessage<BackupRequest> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_backup, 0);

/**
 * @generated from message rpc.proto.v1.BackupResponse
 */
export type BackupResponse = Message<"rpc.proto.v1.BackupResponse"> & {
  /**
   * @generated from field: rpc.proto.v1.BackupType type = 1;
   */
  type: BackupType;

  /**
   * @generated from field: bytes result = 2;
   */
  result: Uint8Array;
};

/**
 * Describes the message rpc.proto.v1.BackupResponse.
 * Use `create(BackupResponseSchema)` to create a new message.
 */
export const BackupResponseSchema: GenMessage<BackupResponse> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_backup, 1);

/**
 * @generated from message rpc.proto.v1.ChallengeInfo
 */
export type ChallengeInfo = Message<"rpc.proto.v1.ChallengeInfo"> & {
  /**
   * @generated from field: string uuid = 1;
   */
  uuid: string;

  /**
   * @generated from field: string challenge_string = 2;
   */
  challengeString: string;

  /**
   * @generated from field: int64 created_at = 3;
   */
  createdAt: bigint;

  /**
   * @generated from field: string kind = 4;
   */
  kind: string;

  /**
   * @generated from field: bytes target_object = 5;
   */
  targetObject: Uint8Array;
};

/**
 * Describes the message rpc.proto.v1.ChallengeInfo.
 * Use `create(ChallengeInfoSchema)` to create a new message.
 */
export const ChallengeInfoSchema: GenMessage<ChallengeInfo> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_backup, 2);

/**
 * @generated from message rpc.proto.v1.CreateBackupParams
 */
export type CreateBackupParams = Message<"rpc.proto.v1.CreateBackupParams"> & {
  /**
   * @generated from field: string encrypted_key = 1;
   */
  encryptedKey: string;

  /**
   * @generated from field: string sign_result = 2;
   */
  signResult: string;
};

/**
 * Describes the message rpc.proto.v1.CreateBackupParams.
 * Use `create(CreateBackupParamsSchema)` to create a new message.
 */
export const CreateBackupParamsSchema: GenMessage<CreateBackupParams> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_backup, 3);

/**
 * @generated from enum rpc.proto.v1.BackupType
 */
export enum BackupType {
  /**
   * @generated from enum value: BACKUP_TYPE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: BACKUP_TYPE_CHALLENGE = 1;
   */
  CHALLENGE = 1,

  /**
   * @generated from enum value: BACKUP_TYPE_CREATE = 2;
   */
  CREATE = 2,
}

/**
 * Describes the enum rpc.proto.v1.BackupType.
 */
export const BackupTypeSchema: GenEnum<BackupType> = /*@__PURE__*/
  enumDesc(file_rpc_proto_v1_backup, 0);

