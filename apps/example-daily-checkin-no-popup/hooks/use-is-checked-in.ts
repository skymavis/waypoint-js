import useSWR from "swr"
import { Address } from "viem"

import { CHECK_IN_ABI, CHECK_IN_ADDRESS } from "../common/check-in-contract"
import { web3PublicClient } from "../common/web3-public-client"

export const useIsCheckedIn = (currentAddress: Address) =>
  useSWR(["useIsCheckedIn", currentAddress], async args => {
    const [, currentAddress] = args

    const isMissed = await web3PublicClient.readContract({
      address: CHECK_IN_ADDRESS,
      abi: CHECK_IN_ABI,
      functionName: "isMissedCheckIn",
      args: [currentAddress],
    })

    return !isMissed
  })
