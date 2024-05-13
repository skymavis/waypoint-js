"use client"

import { useContext } from "react"

import { WalletgoDialogContext } from "../contexts/WalletContext"

export const useWalletgoDialog = () => useContext(WalletgoDialogContext)
