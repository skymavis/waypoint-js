import {
  InternalRpcError,
  InvalidParamsRpcError,
  TransactionRejectedRpcError,
  UnauthorizedProviderError,
  UserRejectedRequestError,
} from "viem"

type IdError = {
  code: number
  message: string
}

/**
 * Dictionary Errors:
 * - User Error: 1xxx
 * - Logic Error: 2xxx
 * - Server Error: 3xxx
 * - Chain Error: 4xxx
 */
const IdErrorMap = Object.freeze({
  /* 1xxx */
  WALLET_USER_CANCEL: {
    code: 1000,
    message: "User rejected",
  },
  WALLET_SIGN_NO_PARAMS: {
    code: 1001,
    message: "Missing message or typedData",
  },
  WALLET_INVALID_PAYLOAD: {
    code: 1003,
    message: "Invalid payload",
  },
  AUTHORIZE_INVALID_PAYLOAD: {
    code: 1004,
    message: "Invalid payload",
  },
  /* 2xxx */
  WALLET_UNKNOWN_ERR: {
    code: 2000,
    message: "Unknown error",
  },
  WALLET_NO_ADDRESS_ERR: {
    code: 2001,
    message: "Can't get user address",
  },
  /* 3xxx */
  WALLET_CANT_CREATE: {
    code: 3000,
    message: "Can't create the wallet",
  },
  /* 4xxx */
  WALLET_CANT_SIMULATE: {
    code: 4000,
    message: "Can't simulate contract request",
  },
} as const)

export const normalizeIdError = (idErr: IdError) => {
  switch (idErr.code) {
    case IdErrorMap.WALLET_USER_CANCEL.code: {
      const err = new Error("user reject action on Ronin Waypoint")
      return new UserRejectedRequestError(err)
    }

    case IdErrorMap.WALLET_SIGN_NO_PARAMS.code: {
      const err = new Error("sign data is NOT valid")
      return new InvalidParamsRpcError(err)
    }

    case IdErrorMap.WALLET_INVALID_PAYLOAD.code: {
      const err = new Error("wallet payload is NOT valid")
      return new InvalidParamsRpcError(err)
    }

    case IdErrorMap.AUTHORIZE_INVALID_PAYLOAD.code: {
      const err = new Error("authorize payload is NOT valid")
      return new InvalidParamsRpcError(err)
    }

    case IdErrorMap.WALLET_NO_ADDRESS_ERR.code: {
      const err = new Error("id wallet is NOT define")
      return new UnauthorizedProviderError(err)
    }

    case IdErrorMap.WALLET_CANT_CREATE.code: {
      const err = new Error("could NOT create wallet")
      return new UnauthorizedProviderError(err)
    }

    case IdErrorMap.WALLET_CANT_SIMULATE.code: {
      const err = new Error("transaction simulate fail")
      return new TransactionRejectedRpcError(err)
    }

    default: {
      const err = new Error("unknown Ronin Waypoint error")
      return new InternalRpcError(err)
    }
  }
}
