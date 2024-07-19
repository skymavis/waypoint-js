import { FC, useState } from "react"
import { Address } from "viem"

import { web3PublicClient, web3WalletClient } from "../web3-client"
import { CHECK_IN_ABI, CHECK_IN_ADDRESS } from "./common"
import { useIsCheckedIn } from "./use-is-checked-in"

type Props = {
  account: Address
}
export const CheckIn: FC<Props> = ({ account }) => {
  const { data: isCheckedIn, loading, refetch: refetchCheckedIn } = useIsCheckedIn(account)

  const [txHash, setTxHash] = useState<string>()
  const [isWaitTx, setIsWaitTx] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const handleCheckIn = async () => {
    setTxHash(undefined)
    setIsWaitTx(true)

    try {
      const { request } = await web3PublicClient.simulateContract({
        account,
        address: CHECK_IN_ADDRESS,
        abi: CHECK_IN_ABI,
        functionName: "checkIn",
        args: [account],
      })

      const txHash = await web3WalletClient.writeContract(request)
      setTxHash(txHash)

      const receipt = await web3PublicClient.waitForTransactionReceipt({
        hash: txHash,
      })

      if (receipt.status === "success") {
        refetchCheckedIn()
        setError(undefined)
        setIsWaitTx(false)

        return
      }

      throw "Transaction reverted!"
    } catch (error) {
      console.log(error)

      setError("Could NOT send transaction - check your console for future details.")
      setTxHash(undefined)
      setIsWaitTx(false)
    }
  }

  return (
    <div>
      <div className="mt-8 font-semibold tracking-wider">
        {loading ? (
          <div className="text-yellow-600">Loading...</div>
        ) : (
          <>
            {isCheckedIn ? (
              <div className="text-green-600">You are already checked in for today.</div>
            ) : (
              <div className="text-yellow-600">Please check in now!</div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl mt-2 disabled:opacity-50"
          disabled={isCheckedIn || loading || isWaitTx}
          onClick={handleCheckIn}
        >
          {isWaitTx ? "Wait for transaction" : "Check In"}
        </button>

        {txHash && (
          <>
            <p className="font-semibold text-green-600">Send successfully!</p>
            <a
              className="text-blue-700 hover:text-blue-800"
              href={`https://saigon-app.roninchain.com/tx/${txHash}`}
            >
              Check your transaction here
            </a>
          </>
        )}

        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  )
}
