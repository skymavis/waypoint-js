import Link from "next/link"
import * as React from "react"
import { EXPLORER_DOMAIN } from "src/contexts/WalletContext"

import { Input } from "../@/components/ui/input"

type ResultType = "text" | "transaction_hash"

type WrapperProps = {
  value?: string
  type: ResultType
  children?: React.ReactNode
}

const Wrapper = ({ value, type, children }: WrapperProps) => {
  if (type === "transaction_hash" && value !== "") {
    return (
      <Link href={`${EXPLORER_DOMAIN}/tx/${value}`} target="_blank" tabIndex={-1}>
        {children}
      </Link>
    )
  }

  return children
}

type ResultProps = {
  value?: string
  placeholder?: string
  type?: ResultType
}

const Result = ({ value = "", placeholder, type = "text" }: ResultProps) => {
  return (
    <Wrapper value={value} type={type}>
      <Input
        tabIndex={-1}
        placeholder={placeholder}
        value={value}
        readOnly
        type="string"
        className={type === "transaction_hash" ? "cursor-pointer" : ""}
      />
    </Wrapper>
  )
}

Result.displayName = "Result"

export { Result }
