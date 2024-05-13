"use client"

import { useCallback } from "react"
import { useToast } from "src/@/components/ui/use-toast"

export const useWrapToast = () => {
  const { toast } = useToast()

  const toastSuccess = useCallback(
    (message: string) => {
      toast({
        title: "Done",
        description: message,
        variant: "default",
        className: "bg-green-600",
      })
    },
    [toast],
  )

  const toastError = useCallback(
    (message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    },
    [toast],
  )

  const toastConsoleError = useCallback(() => {
    toast({
      title: "Error",
      description: "Check your console for more information!",
      variant: "destructive",
    })
  }, [toast])

  return { toastError, toastSuccess, toastConsoleError }
}
