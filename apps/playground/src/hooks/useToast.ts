"use client"

import { useContext } from "react"
import { ToastContext } from "src/contexts/ToastContext"

export const useGlobalToast = () => useContext(ToastContext)
