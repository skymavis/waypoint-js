"use client"

import { useContext } from "react"

import { OtherWalletDialogContext } from "../contexts/OtherWalletContext"

export const useWalletgoDialog = () => useContext(OtherWalletDialogContext)
