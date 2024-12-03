/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

// NOTE: This files were cloned from "viem@2.9.2" since hashStuct is not exported
// FIXME: Use exported from "viem" when hashStuct is exported
import type { AbiParameter, HashTypedDataParameters, TypedData, TypedDataDomain } from "viem"
import {
  concatBytes,
  encodeAbiParameters,
  getTypesForEIP712Domain,
  keccak256,
  toBytes,
  toHex,
  validateTypedData,
} from "viem"

import { bytesToBase64 } from "./convertor"

type MessageTypeProperty = {
  name: string
  type: string
}

export function toWasmSignTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | "EIP712Domain",
>(parameters: HashTypedDataParameters<typedData, primaryType>): string {
  const { domain = {}, message, primaryType } = parameters as HashTypedDataParameters
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types,
  }

  // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
  // as we can't statically check this with TypeScript.
  validateTypedData({
    domain,
    message,
    primaryType,
    types,
  })

  const parts: Uint8Array[] = [toBytes("0x1901")]
  if (domain)
    parts.push(
      toBytes(
        hashDomain({
          domain,
          types: types as Record<string, MessageTypeProperty[]>,
        }),
      ),
    )

  if (primaryType !== "EIP712Domain")
    parts.push(
      toBytes(
        hashStruct({
          data: message,
          primaryType,
          types: types as Record<string, MessageTypeProperty[]>,
        }),
      ),
    )

  const bytesData = concatBytes(parts)

  return bytesToBase64(bytesData)
}

function hashDomain({
  domain,
  types,
}: {
  domain: TypedDataDomain
  types: Record<string, MessageTypeProperty[]>
}) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types,
  })
}

function hashStruct({
  data,
  primaryType,
  types,
}: {
  data: Record<string, unknown>
  primaryType: string
  types: Record<string, MessageTypeProperty[]>
}) {
  const encoded = encodeData({
    data,
    primaryType,
    types,
  })
  return keccak256(encoded)
}

function encodeData({
  data,
  primaryType,
  types,
}: {
  data: Record<string, unknown>
  primaryType: string
  types: Record<string, MessageTypeProperty[]>
}) {
  const encodedTypes: AbiParameter[] = [{ type: "bytes32" }]
  const encodedValues: unknown[] = [hashType({ primaryType, types })]

  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name],
    })
    encodedTypes.push(type)
    encodedValues.push(value)
  }

  return encodeAbiParameters(encodedTypes, encodedValues)
}

function hashType({
  primaryType,
  types,
}: {
  primaryType: string
  types: Record<string, MessageTypeProperty[]>
}) {
  const encodedHashType = toHex(encodeType({ primaryType, types }))
  return keccak256(encodedHashType)
}

function encodeType({
  primaryType,
  types,
}: {
  primaryType: string
  types: Record<string, MessageTypeProperty[]>
}) {
  let result = ""
  const unsortedDeps = findTypeDependencies({ primaryType, types })
  unsortedDeps.delete(primaryType)

  const deps = [primaryType, ...Array.from(unsortedDeps).sort()]
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`
  }

  return result
}

function findTypeDependencies(
  {
    primaryType: primaryType_,
    types,
  }: {
    primaryType: string
    types: Record<string, MessageTypeProperty[]>
  },
  results: Set<string> = new Set(),
): Set<string> {
  const match = primaryType_.match(/^\w*/u)
  const primaryType = match?.[0]!
  if (results.has(primaryType) || types[primaryType] === undefined) {
    return results
  }

  results.add(primaryType)

  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results)
  }
  return results
}

function encodeField({
  types,
  name,
  type,
  value,
}: {
  types: Record<string, MessageTypeProperty[]>
  name: string
  type: string
  value: any
}): [type: AbiParameter, value: any] {
  if (types[type] !== undefined) {
    return [{ type: "bytes32" }, keccak256(encodeData({ data: value, primaryType: type, types }))]
  }

  if (type === "bytes") {
    const prepend = value.length % 2 ? "0" : ""
    value = `0x${prepend + value.slice(2)}`
    return [{ type: "bytes32" }, keccak256(value)]
  }

  if (type === "string") return [{ type: "bytes32" }, keccak256(toHex(value))]

  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["))
    const typeValuePairs = (value as [AbiParameter, any][]).map(item =>
      encodeField({
        name,
        type: parsedType,
        types,
        value: item,
      }),
    )
    return [
      { type: "bytes32" },
      keccak256(
        encodeAbiParameters(
          typeValuePairs.map(([t]) => t),
          typeValuePairs.map(([, v]) => v),
        ),
      ),
    ]
  }

  return [{ type }, value]
}
