// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file rpc/proto/v1/payer.proto (package rpc.proto.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file rpc/proto/v1/payer.proto.
 */
export const file_rpc_proto_v1_payer: GenFile = /*@__PURE__*/
  fileDesc("ChhycGMvcHJvdG8vdjEvcGF5ZXIucHJvdG8SDHJwYy5wcm90by52MSIuChZQYXllckFjY2Vzc1Rva2VuUGFyYW1zEhQKDHNpd2VfbWVzc2FnZRgBIAEoCSItChRQYXllckFjY2Vzc1Rva2VuRGF0YRIVCg1hY2NjZXNzX3Rva2VuGAEgASgJQj1aO2dpdGh1Yi5jb20vYXhpZWluZmluaXR5L3gtc2VydmljZS9nZW4vZ28vcnBjL3Byb3RvL3YxO3JwY3YxYgZwcm90bzM");

/**
 * @generated from message rpc.proto.v1.PayerAccessTokenParams
 */
export type PayerAccessTokenParams = Message<"rpc.proto.v1.PayerAccessTokenParams"> & {
  /**
   * @generated from field: string siwe_message = 1;
   */
  siweMessage: string;
};

/**
 * Describes the message rpc.proto.v1.PayerAccessTokenParams.
 * Use `create(PayerAccessTokenParamsSchema)` to create a new message.
 */
export const PayerAccessTokenParamsSchema: GenMessage<PayerAccessTokenParams> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_payer, 0);

/**
 * @generated from message rpc.proto.v1.PayerAccessTokenData
 */
export type PayerAccessTokenData = Message<"rpc.proto.v1.PayerAccessTokenData"> & {
  /**
   * @generated from field: string acccess_token = 1;
   */
  acccessToken: string;
};

/**
 * Describes the message rpc.proto.v1.PayerAccessTokenData.
 * Use `create(PayerAccessTokenDataSchema)` to create a new message.
 */
export const PayerAccessTokenDataSchema: GenMessage<PayerAccessTokenData> = /*@__PURE__*/
  messageDesc(file_rpc_proto_v1_payer, 1);

