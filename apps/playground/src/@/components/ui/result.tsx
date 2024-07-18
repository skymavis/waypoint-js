import Link from "next/link"
import * as React from "react"
import { EXPLORER_DOMAIN } from "src/contexts/WalletContext"

import { Input } from "./input"

type ResultType = "text" | "transaction_hash"

const Result = ({
  value = "",
  placeholder,
  type = "text",
  ...props
}: {
  value?: string
  placeholder?: string
  type?: ResultType
}) => {
  const isTransactionHash = type === "transaction_hash" && value !== ""
  const Wrapper = isTransactionHash ? Link : React.Fragment
  const wrapperProps = isTransactionHash
    ? {
        href: `${EXPLORER_DOMAIN}/tx/${value}`,
        target: "_blank",
        tabIndex: -1,
      }
    : {}

  return (
    <Wrapper {...wrapperProps} {...props}>
      <Input tabIndex={-1} placeholder={placeholder} value={value} readOnly type="string" />
    </Wrapper>
  )
}

Result.displayName = "Result"

export { Result }
