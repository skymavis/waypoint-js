// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file rpc/proto/v1/auth.proto (package rpc.proto.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_struct } from "@bufbuild/protobuf/wkt";
import type { JsonObject, Message } from "@bufbuild/protobuf";

/**
 * Describes the file rpc/proto/v1/auth.proto.
 */
export const file_rpc_proto_v1_auth: GenFile = /*@__PURE__*/
  fileDesc("ChdycGMvcHJvdG8vdjEvYXV0aC5wcm90bxIMcnBjLnByb3RvLnYxIlQKE0F1dGhlbnRpY2F0ZVJlcXVlc3QSDQoFdG9rZW4YASABKAkSLgoNb3B0aW9uYWxfZGF0YRgKIAEoCzIXLmdvb2dsZS5wcm90b2J1Zi5TdHJ1Y3QidAoUQXV0aGVudGljYXRlUmVzcG9uc2USDAoEdXVpZBgBIAEoCRIOCgZhcHBfaWQYAiABKAkSDgoGaXNzdWVyGAMgASgJEi4KDW9wdGlvbmFsX2RhdGEYCiABKAsyFy5nb29nbGUucHJvdG9idWYuU3RydWN0Qj1aO2dpdGh1Yi5jb20vYXhpZWluZmluaXR5L3gtc2VydmljZS9nZW4vZ28vcnBjL3Byb3RvL3YxO3JwY3YxYgZwcm90bzM", [file_google_protobuf_struct]);

/**
 * @generated from message rpc.proto.v1.AuthenticateRequest
 */
export type AuthenticateRequest = Message<"rpc.proto.v1.AuthenticateRequest"> & {
  /**
   * @generated from field: string token = 1;
   */
  token: string;

  /**
   * @generated from field: google.protobuf.Struct optional_data = 10;
   */
  optionalData?: JsonObject;
};

/**
 * Describes the message rpc.proto.v1.AuthenticateRequest.
 * Use `create(AuthenticateRequestSchema)` to create a new message.
 */
export const AuthenticateRequestSchema: GenMessage<AuthenticateRequest> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_auth, 0);

/**
 * @generated from message rpc.proto.v1.AuthenticateResponse
 */
export type AuthenticateResponse = Message<"rpc.proto.v1.AuthenticateResponse"> & {
  /**
   * @generated from field: string uuid = 1;
   */
  uuid: string;

  /**
   * @generated from field: string app_id = 2;
   */
  appId: string;

  /**
   * @generated from field: string issuer = 3;
   */
  issuer: string;

  /**
   * @generated from field: google.protobuf.Struct optional_data = 10;
   */
  optionalData?: JsonObject;
};

/**
 * Describes the message rpc.proto.v1.AuthenticateResponse.
 * Use `create(AuthenticateResponseSchema)` to create a new message.
 */
export const AuthenticateResponseSchema: GenMessage<AuthenticateResponse> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_auth, 1);
