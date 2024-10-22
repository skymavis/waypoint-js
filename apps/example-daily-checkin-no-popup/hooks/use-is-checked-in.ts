import { useCallback, useEffect, useState } from "react"
import { Address } from "viem"

import { CHECK_IN_ABI, CHECK_IN_ADDRESS } from "../common/check-in-contract"
import { web3PublicClient } from "../common/web3-public-client"

export const useIsCheckedIn = (currentAddress: Address) => {
  const [missed, setMissed] = useState<boolean | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const fetchIsCheckedIn = useCallback(async () => {
    setLoading(true)
    setMissed(undefined)

    try {
      const isMissed = await web3PublicClient.readContract({
        address: CHECK_IN_ADDRESS,
        abi: CHECK_IN_ABI,
        functionName: "isMissedCheckIn",
        args: [currentAddress],
      })

      setMissed(isMissed)
      setLoading(false)
      return
    } catch (error) {
      /* empty */
    }

    setMissed(undefined)
    setLoading(false)
  }, [currentAddress])

  useEffect(() => {
    fetchIsCheckedIn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress])

  return {
    data: !missed,
    loading,
    refetch: fetchIsCheckedIn,
  }
}
