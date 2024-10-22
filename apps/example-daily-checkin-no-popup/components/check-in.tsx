import { FC, useState } from "react"
import { Address } from "viem"

import { CHECK_IN_ABI, CHECK_IN_ADDRESS } from "../common/check-in-contract"
import { web3PublicClient } from "../common/web3-public-client"
import { useIsCheckedIn } from "../hooks/use-is-checked-in"
import { useWallet } from "../hooks/use-wallet"

type Props = {
  account: Address
}
export const CheckIn: FC<Props> = ({ account }) => {
  const { walletClient, requestWalletClient } = useWallet()

  const { data: isCheckedIn, loading, refetch: refetchCheckedIn } = useIsCheckedIn(account)

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
        refetchCheckedIn()
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

  return (
    <div className="flex flex-col">
      <div className="font-semibold tracking-wider">
        {loading ? (
          <div className="text-cyan-600">Loading...</div>
        ) : (
          <>
            {isCheckedIn ? (
              <div className="text-amber-600">You are already checked in for today.</div>
            ) : (
              <div className="text-emerald-600">Please check in now!</div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {walletClient && (
          <button
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl mt-2 disabled:opacity-50 tracking-wider"
            disabled={isCheckedIn || loading || isWaitTx}
            onClick={handleCheckIn}
          >
            {isWaitTx ? "Wait for transaction" : "Check In"}
          </button>
        )}

        {!walletClient && (
          <button
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl mt-2 disabled:opacity-50 tracking-wider"
            onClick={handleUnlock}
          >
            Unlock your wallet
          </button>
        )}

        {txHash && (
          <>
            <p className="font-semibold text-emerald-600">Send successfully!</p>
            <a
              className="text-sky-600 hover:text-sky-700 font-semibold"
              href={`https://saigon-app.roninchain.com/tx/${txHash}`}
            >
              Check your transaction here
            </a>
          </>
        )}

        {error && <p className="text-rose-600 font-semibold">{error}</p>}
      </div>
    </div>
  )
}
