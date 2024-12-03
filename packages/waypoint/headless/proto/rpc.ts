// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file rpc/proto/v1/rpc.proto (package rpc.proto.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file rpc/proto/v1/rpc.proto.
 */
export const file_rpc_proto_v1_rpc: GenFile = /*@__PURE__*/
  fileDesc("ChZycGMvcHJvdG8vdjEvcnBjLnByb3RvEgxycGMucHJvdG8udjEiQwoFRnJhbWUSIAoEdHlwZRgBIAEoDjISLnJwYy5wcm90by52MS5UeXBlEgoKAmlkGAIgASgFEgwKBGRhdGEYAyABKAwiJgoFRXJyb3ISDAoEY29kZRgBIAEoBBIPCgdtZXNzYWdlGAIgASgJIhUKAk9rEg8KB21lc3NhZ2UYAiABKAkiHQoHU2Vzc2lvbhISCgpzZXNzaW9uX2lkGAEgASgJKkoKBFR5cGUSFAoQVFlQRV9VTlNQRUNJRklFRBAAEg0KCVRZUEVfREFUQRABEg4KClRZUEVfRVJST1IQAhINCglUWVBFX0RPTkUQA0I9WjtnaXRodWIuY29tL2F4aWVpbmZpbml0eS94LXNlcnZpY2UvZ2VuL2dvL3JwYy9wcm90by92MTtycGN2MWIGcHJvdG8z");

/**
 * @generated from message rpc.proto.v1.Frame
 */
export type Frame = Message<"rpc.proto.v1.Frame"> & {
  /**
   * @generated from field: rpc.proto.v1.Type type = 1;
   */
  type: Type;

  /**
   * @generated from field: int32 id = 2;
   */
  id: number;

  /**
   * @generated from field: bytes data = 3;
   */
  data: Uint8Array;
};

/**
 * Describes the message rpc.proto.v1.Frame.
 * Use `create(FrameSchema)` to create a new message.
 */
export const FrameSchema: GenMessage<Frame> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_rpc, 0);

/**
 * @generated from message rpc.proto.v1.Error
 */
export type Error = Message<"rpc.proto.v1.Error"> & {
  /**
   * @generated from field: uint64 code = 1;
   */
  code: bigint;

  /**
   * @generated from field: string message = 2;
   */
  message: string;
};

/**
 * Describes the message rpc.proto.v1.Error.
 * Use `create(ErrorSchema)` to create a new message.
 */
export const ErrorSchema: GenMessage<Error> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_rpc, 1);

/**
 * @generated from message rpc.proto.v1.Ok
 */
export type Ok = Message<"rpc.proto.v1.Ok"> & {
  /**
   * @generated from field: string message = 2;
   */
  message: string;
};

/**
 * Describes the message rpc.proto.v1.Ok.
 * Use `create(OkSchema)` to create a new message.
 */
export const OkSchema: GenMessage<Ok> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_rpc, 2);

/**
 * Specific logic
 *
 * @generated from message rpc.proto.v1.Session
 */
export type Session = Message<"rpc.proto.v1.Session"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;
};

/**
 * Describes the message rpc.proto.v1.Session.
 * Use `create(SessionSchema)` to create a new message.
 */
export const SessionSchema: GenMessage<Session> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_rpc, 3);

/**
 * @generated from enum rpc.proto.v1.Type
 */
export enum Type {
  /**
   * @generated from enum value: TYPE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: TYPE_DATA = 1;
   */
  DATA = 1,

  /**
   * @generated from enum value: TYPE_ERROR = 2;
   */
  ERROR = 2,

  /**
   * @generated from enum value: TYPE_DONE = 3;
   */
  DONE = 3,
}

/**
 * Describes the enum rpc.proto.v1.Type.
 */
export const TypeSchema: GenEnum<Type> = /*@__PURE__*/
  enumDesc(file_rpc_proto_v1_rpc, 0);

