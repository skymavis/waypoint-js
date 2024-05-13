import { CommunicateHelper } from "./common/communicate-helper"
import { IEip1193RequestArgs } from "./common/eip1193"
import { JsonRpcError, RpcErrorCode } from "./common/error"
import { openPopup } from "./utils/popup"

export interface TypedDataDomain {
  name?: string
  version?: string
  chainId?: string | number
  verifyingContract?: string
  salt?: ArrayLike<number> | string
}

export interface TypedDataField {
  name: string
  type: string
}

export type TypedDataPayload = {
  types: Record<string, Array<TypedDataField>>
  domain: TypedDataDomain
  primaryType: string
  message: Record<string, any>
}

export type SignTypedDataV4Params = {
  params?: IEip1193RequestArgs["params"]
  clientId: string
  chainId: number
  gateOrigin: string
  communicateHelper: CommunicateHelper
}

const REQUIRED_TYPED_DATA_PROPERTIES = ["types", "domain", "primaryType", "message"]

const isValidTypedDataPayload = (typedData: object): typedData is TypedDataPayload =>
  REQUIRED_TYPED_DATA_PROPERTIES.every(key => key in typedData)

const transformTypedData = (typedData: string | object, chainId: number): TypedDataPayload => {
  const transformedTypedData: object | TypedDataPayload = (() => {
    if (typeof typedData === "string") {
      try {
        return JSON.parse(typedData)
      } catch (err: any) {
        throw new JsonRpcError(
          RpcErrorCode.INVALID_PARAMS,
          `Failed to parse typed data JSON: ${err}`,
        )
      }
    }

    if (typeof typedData === "object") return typedData

    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid typed data argument: ${typedData}`)
  })()

  if (!isValidTypedDataPayload(transformedTypedData))
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `Invalid typed data argument. The following properties are required: ${REQUIRED_TYPED_DATA_PROPERTIES.join(
        ", ",
      )}`,
    )

  const providedChainId: number | string | undefined = (transformedTypedData as any).domain?.chainId
  if (providedChainId) {
    // domain.chainId (if defined) can be a number, string, or hex value, but the relayer & guardian only accept a number.
    if (typeof providedChainId === "string") {
      if (providedChainId.startsWith("0x")) {
        transformedTypedData.domain.chainId = parseInt(providedChainId, 16)
      } else {
        transformedTypedData.domain.chainId = parseInt(providedChainId, 10)
      }
    }

    if (transformedTypedData.domain.chainId !== chainId)
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid chainId, expected ${chainId}`)
  }

  return transformedTypedData
}

export const signTypedDataV4 = async ({
  params,
  clientId,
  chainId,
  gateOrigin,
  communicateHelper,
}: SignTypedDataV4Params): Promise<string> => {
  const fromAddress: string | undefined = params?.[0]
  const typedDataParam: string | object | undefined = params?.[1]

  if (!fromAddress || !typedDataParam)
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `eth_signTypedData_v4 requires an address and a typed data JSON`,
    )

  const typedData = transformTypedData(typedDataParam, chainId)

  const signature = await communicateHelper.sendRequest<string>(requestId =>
    openPopup(`${gateOrigin}/wallet/sign`, {
      clientId,
      state: requestId,
      origin: window.location.origin,
      typedData: JSON.stringify(typedData),
    }),
  )

  return signature
}
