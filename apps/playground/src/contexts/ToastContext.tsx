"use client"

import { ToastContent, useToast } from "@axieinfinity/ronin-ui"
import { NotificationAPI } from "rc-notification"
import { createContext, FC } from "react"

type Props = {
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export interface IToastContext {
  showError: (content?: string) => void
  showSuccess: (content?: string) => void
  hideToast: () => void
  notice?: NotificationAPI //to do: export the interface of notice later
}

export const ToastContext = createContext<IToastContext>({
  showError: noop,
  showSuccess: noop,
  hideToast: noop,
  notice: undefined,
})

export const ToastProvider: FC<Props> = ({ children }) => {
  const { notice, contextHolder } = useToast()

  const showError = (content?: string) => {
    notice.open({
      content: (
        <ToastContent
          helpText={content ?? "Please check console for more information!"}
          intent="critical"
          label="Error"
        />
      ),
      placement: "bottomLeft",
      duration: 3,
    })
  }

  const showSuccess = (content?: string) => {
    notice.open({
      content: (
        <ToastContent
          helpText={content ?? "Action is completed successfully!"}
          intent="success"
          label="Success"
        />
      ),
      placement: "bottomLeft",
      duration: 3,
    })
  }

  const hideToast = () => {
    notice.destroy()
  }

  return (
    <ToastContext.Provider value={{ showError, hideToast, notice, showSuccess }}>
      {children}
      {contextHolder}
    </ToastContext.Provider>
  )
}
