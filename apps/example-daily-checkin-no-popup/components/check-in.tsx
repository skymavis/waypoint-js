import { FC, useState } from "react"
import { Address, formatTransactionRequest, getAddress } from "viem"

import { headlessClient } from "@/common/headless-client"
import { WP_TOKEN_STORAGE_KEY } from "@/common/storage"

import { CHECK_IN_ABI, CHECK_IN_ADDRESS } from "../common/check-in-contract"
import { web3PublicClient } from "../common/web3-public-client"
import { useIsCheckedIn } from "../hooks/use-is-checked-in"
import { useWallet } from "../hooks/use-wallet"

type Props = {
  account: Address
}
export const CheckIn: FC<Props> = ({ account }) => {
  const { walletClient, requestWalletClient } = useWallet()

  const { data: isCheckedIn, isLoading, mutate } = useIsCheckedIn(account)

  const [txHash, setTxHash] = useState<string>()
  const [isWaitTx, setIsWaitTx] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const handleUnlock = async () => {
    requestWalletClient()
  }

  const handleCheckIn = async () => {
    setTxHash(undefined)
    setIsWaitTx(true)

    try {
      if (walletClient === undefined) {
        throw "Wallet client is not ready! Please unlock your wallet first."
      }

      const { request } = await web3PublicClient.simulateContract({
        account,
        address: CHECK_IN_ADDRESS,
        abi: CHECK_IN_ABI,
        functionName: "checkIn",
        args: [account],
      })

      const txHash = await walletClient.writeContract(request)
      setTxHash(txHash)

      const receipt = await web3PublicClient.waitForTransactionReceipt({
        hash: txHash,
      })

      if (receipt.status === "success") {
        mutate()
        setError(undefined)
        setIsWaitTx(false)

        return
      }

      throw "Transaction reverted!"
    } catch (error) {
      console.debug("🚀 | handleCheckIn:", error)

      setError("Could NOT send transaction - check your console for future details.")
      setTxHash(undefined)
      setIsWaitTx(false)
    }
  }

  const handleValidate = async () => {
    if (walletClient === undefined) {
      throw "Wallet client is not ready! Please unlock your wallet first."
    }

    // const { request } = await web3PublicClient.simulateContract({
    //   account,
    //   address: CHECK_IN_ADDRESS,
    //   abi: CHECK_IN_ABI,
    //   functionName: "checkIn",
    //   args: [account],
    // })

    const token = localStorage.getItem(WP_TOKEN_STORAGE_KEY) ?? ""
    console.debug("🚀 | token:", token)

    const txRequest = await web3PublicClient.prepareTransactionRequest({
      to: getAddress("0xcd3cf91e7f0601ab98c95dd18b4f99221bcf0b20"),
      value: 10000n,
    })
    const rpcTx = formatTransactionRequest(txRequest)
    console.debug("🚀 | rpcTx:", rpcTx)

    const validateResult = await headlessClient.validateSponsorTx({
      waypointToken: token,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      txRequest: rpcTx as any,
    })

    console.debug("🚀 | validateResult:", validateResult)
  }

  return (
    <div className="mt-6 flex flex-col">
      <div className="flex flex-col space-y-1 text-base tracking-wide font-medium">
        {isLoading || !isCheckedIn ? (
          <>
            <img src="./check-in.png" className="size-16" />
            <div className="text-sky-600">{isLoading ? "Loading..." : "Please check in now!"}</div>
          </>
        ) : (
          <>
            <img src="./calendar.png" className="size-16" />
            <div className="text-amber-600">You are already checked in for today.</div>
          </>
        )}
      </div>

      {!isCheckedIn && !isLoading && (
        <div className="flex flex-col gap-2 mt-2">
          {walletClient && (
            <button
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-full mt-2 disabled:opacity-50 tracking-wider"
              disabled={isCheckedIn || isLoading || isWaitTx}
              onClick={handleCheckIn}
            >
              {isWaitTx ? "Wait for transaction" : "Check In"}
            </button>
          )}

          {!walletClient && (
            <button
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-full mt-2 disabled:opacity-50 tracking-wider"
              onClick={handleUnlock}
            >
              Unlock your wallet
            </button>
          )}
        </div>
      )}
      {/* 
      <button
        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-full mt-2 disabled:opacity-50 tracking-wider"
        onClick={handleValidate}
      >
        Validate
      </button> */}

      <div className="border-t border-slate-400 mt-3 mb-4" />

      <div className="font-medium inline-flex">
        {txHash && (
          <>
            Check your transaction:&nbsp;
            <a
              className="text-sky-600 hover:text-sky-700"
              href={`https://saigon-app.roninchain.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            !
          </>
        )}
        {error && <p className="text-rose-400">{error}</p>}
      </div>
    </div>
  )
}
