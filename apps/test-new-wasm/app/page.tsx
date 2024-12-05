"use client"

import {
  backupShard,
  decryptShard,
  encryptShard,
  getAddressFromShard,
  getBackupClientShard,
  getUserProfile,
  keygen,
  personalSign,
  sendLegacyTransaction,
  sendSponsoredTransaction,
  signTypedData,
  validateSponsorTransaction,
} from "@sky-mavis/waypoint/headless"
import { useState } from "react"
import { getAddress, TypedDataDefinition } from "viem"
import { saigon } from "viem/chains"

import { Button } from "./button"
import { Divider } from "./divider"
import { calcExecutionTime } from "./performance"

const WASM_URL = "/mpc.wasm"
// const LOCKBOX_PROD_HTTP_URL = "https://lockbox.skymavis.com"
// const LOCKBOX_PROD_WS_URL = "wss://lockbox.skymavis.com"

const LOCKBOX_STAG_HTTP_URL = "https://project-x.skymavis.one"
const LOCKBOX_STAG_WS_URL = "wss://project-x.skymavis.one"

const CLIENT_SHARD =
  "eyJjaGFpbktleSI6ImFvYThudk1wV3FIK2dFS2F3QlJjYXdxWkVjVDh3TUtabTV2N2dYM3dmTVk9Iiwic2VjcmV0U2hhcmUiOiJSYi9BYW1JMzJZSTZvRU9CaXRQSTcxak9paHBONEhnYjBQbWdhYnRCNm9BPSIsInB1YmxpY1BvaW50IjoiQXlzblRDbWpTcWxBbVAvWEdFbUdqeWNMM0NuUDNGYWVGOUZ3aVFvYjVUZUEiLCJhcHBJRCI6IiJ9"
const WAYPOINT_TOKEN =
  "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiJ3YWxsZXR4IiwiaXNzIjoiZGVmYXVsdCIsInV1aWQiOiJiZW5jaC0wMTkzMDVhYWI0YmE3NmM2YWM3OTk5ZTU5ZjllZTViZCJ9.uBelr3FxaLwwg97Q275D_gHYto8Ma_mRCRvSs1vKHf9eRPqYCp7nqMY7AsQ_9bDZJSKsJsqH2QF-jiRnDmPaOA"
const RECOVERY_PASSWORD = "123123123"
const BACKUP_DATA =
  "REJESCtyN0xCeW5tb1VUVFF4QTZBaTFIMWhNUEdJVGp5UXpobVczanBGUUs4aG42QWlhTVVJR3didTZHNDZ6d2l5K2NSTlFIaWNEUlFNUzdQTE14Zm93OE1ZNCtwMW1qNXhPQldqTzY2UCtkaHNyS1JkMFpEVG5TRHJlZlVEWGN0akw3MjM3MjVsUDAxR2RGdWxEOHVvQ1l6d081SUVwSHA5enZqNlB6MCsyNkpxL0tha282TEp3b3VNSlJjUzdVVkxvSU54cFBESEo1RHhaSGVybTAxWXhldDY3b3RpRml4eitYaVIwcE1LTndrc2s5RkpiM0UvZWdCbUFmSm1QNkdKUW8vOGVvVWhWWWszKzhBS1V4Y3Ftb1pyQktwdkpQeG9pcm42UWtzM0oxTUJ6Mlc3ZENwVkIrdHZ6dEJBelpxSFJYWUxJNU5iVzRHdUdacHo5TURBcG1XQ2lTT1BjbUVCc2MxS2xYRVdxRk5CbVpFQ1lMR3hualJyUTJFQT09"

const ADDRESS = getAddressFromShard(CLIENT_SHARD)
const SAMPLE_TYPED_DATA: TypedDataDefinition = {
  types: {
    Asset: [
      { name: "erc", type: "uint8" },
      { name: "addr", type: "address" },
      { name: "id", type: "uint256" },
      { name: "quantity", type: "uint256" },
    ],
    Order: [
      { name: "maker", type: "address" },
      { name: "kind", type: "uint8" },
      { name: "assets", type: "Asset[]" },
      { name: "expiredAt", type: "uint256" },
      { name: "paymentToken", type: "address" },
      { name: "startedAt", type: "uint256" },
      { name: "basePrice", type: "uint256" },
      { name: "endedAt", type: "uint256" },
      { name: "endedPrice", type: "uint256" },
      { name: "expectedState", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "marketFeePercentage", type: "uint256" },
    ],
  },
  domain: {
    name: "MarketGateway",
    version: "1",
    chainId: 2021,
    verifyingContract: "0xfff9ce5f71ca6178d3beecedb61e7eff1602950e",
  },
  primaryType: "Order",
  message: {
    maker: "0xd761024b4ef3336becd6e802884d0b986c29b35a",
    kind: 1,
    assets: [
      {
        erc: 1,
        addr: "0x32950db2a7164ae833121501c797d79e7b79d74c",
        id: "2730069",
        quantity: "0",
      },
    ],
    expiredAt: "1721709637",
    paymentToken: "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5",
    startedAt: "1705984837",
    basePrice: "500000000000000000",
    endedAt: "0",
    endedPrice: "0",
    expectedState: "0",
    nonce: "0",
    marketFeePercentage: "425",
  },
}

const KeygenTestPage = () => {
  const [wpToken, setWpToken] = useState(WAYPOINT_TOKEN)

  const handleKeygen = () => {
    calcExecutionTime("Keygen", () =>
      keygen({
        wasmUrl: WASM_URL,
        wsUrl: LOCKBOX_STAG_WS_URL,
        waypointToken: wpToken,
      }),
    )
  }
  const handleDecryptShard = () => {
    calcExecutionTime("Decrypt Shard", () =>
      decryptShard({
        waypointToken: WAYPOINT_TOKEN,
        encryptedData: BACKUP_DATA,
        recoveryPassword: RECOVERY_PASSWORD,
      }),
    )
  }
  const handleEncryptShard = async () => {
    calcExecutionTime("Encrypt Shard", () =>
      encryptShard({
        waypointToken: WAYPOINT_TOKEN,
        clientShard: CLIENT_SHARD,
        recoveryPassword: RECOVERY_PASSWORD,
      }),
    )
  }
  const handleBackupShard = async () => {
    calcExecutionTime("Backup Shard", () =>
      backupShard({
        waypointToken: WAYPOINT_TOKEN,
        clientShard: CLIENT_SHARD,
        recoveryPassword: RECOVERY_PASSWORD,

        wsUrl: LOCKBOX_STAG_WS_URL,
      }),
    )
  }

  const handleGetAddress = async () => {
    calcExecutionTime("Get Address", async () => getAddressFromShard(CLIENT_SHARD))
  }

  const handlePersonalSign = async () => {
    calcExecutionTime("Personal Sign", () =>
      personalSign({
        wasmUrl: WASM_URL,
        wsUrl: LOCKBOX_STAG_WS_URL,
        clientShard: CLIENT_SHARD,
        waypointToken: WAYPOINT_TOKEN,
        message: "Hello world",
      }),
    )
  }
  const handleSignTypedData = async () => {
    calcExecutionTime("Sign Typed Data", () =>
      signTypedData({
        wasmUrl: WASM_URL,
        wsUrl: LOCKBOX_STAG_WS_URL,
        clientShard: CLIENT_SHARD,
        waypointToken: WAYPOINT_TOKEN,
        typedData: SAMPLE_TYPED_DATA,
      }),
    )
  }

  const handleSendLegacyTransaction = async () => {
    calcExecutionTime("Send Legacy Tx", () =>
      sendLegacyTransaction({
        clientShard: CLIENT_SHARD,
        waypointToken: WAYPOINT_TOKEN,

        chain: {
          chainId: saigon.id,
          rpcUrl: saigon.rpcUrls.default.http[0],
        },
        transaction: {
          type: "0x0",
          to: getAddress("0xcd3cf91e7f0601ab98c95dd18b4f99221bcf0b20"),
          value: "0x23af16b18000",
        },

        wasmUrl: WASM_URL,
        wsUrl: LOCKBOX_STAG_WS_URL,
      }),
    )
  }
  const handleSendSponsoredTransaction = async () => {
    calcExecutionTime("Send Sponsored Tx", () =>
      sendSponsoredTransaction({
        clientShard: CLIENT_SHARD,
        waypointToken: WAYPOINT_TOKEN,

        chain: {
          chainId: saigon.id,
          rpcUrl: saigon.rpcUrls.default.http[0],
        },
        transaction: {
          type: "0x64",
          to: getAddress("0xcd3cf91e7f0601ab98c95dd18b4f99221bcf0b20"),
          value: "0x23af16b18000",
        },

        wasmUrl: WASM_URL,
        wsUrl: LOCKBOX_STAG_WS_URL,
      }),
    )
  }

  const handleValidateSponsorTransaction = async () => {
    calcExecutionTime("Validate Sponsored Tx", () =>
      validateSponsorTransaction({
        waypointToken: WAYPOINT_TOKEN,

        chain: {
          chainId: saigon.id,
          rpcUrl: saigon.rpcUrls.default.http[0],
        },
        transaction: {
          from: ADDRESS,
          type: "0x64",
          to: getAddress("0xcd3cf91e7f0601ab98c95dd18b4f99221bcf0b20"),
          value: "0x23af16b18000",
        },

        httpUrl: LOCKBOX_STAG_HTTP_URL,
      }),
    )
  }
  const handleGetUserProfile = async () => {
    calcExecutionTime("Get User Profile", () =>
      getUserProfile({
        waypointToken: WAYPOINT_TOKEN,
        httpUrl: LOCKBOX_STAG_HTTP_URL,
      }),
    )
  }
  const handleGetBackupClientShard = async () => {
    calcExecutionTime("Get Backup Client Shard", () =>
      getBackupClientShard({
        waypointToken: WAYPOINT_TOKEN,
        httpUrl: LOCKBOX_STAG_HTTP_URL,
      }),
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2">
      <textarea
        value={wpToken}
        onChange={e => setWpToken(e.target.value)}
        rows={7}
        className="w-full border border-solid border-slate-300 rounded-lg p-3 text-sm"
      />
      <div className="font-mono text-xs text-slate-600">
        Change this value for testing Keygen only
      </div>
      <Button onClick={handleKeygen}>Keygen</Button>
      <Divider />
      <Button onClick={handleEncryptShard}>Encrypt shard</Button>
      <Button onClick={handleBackupShard}>Backup shard</Button>
      <Button onClick={handleDecryptShard}>Decrypt shard</Button>
      <Divider />
      <Button onClick={handleGetAddress}>Get address</Button>
      <Divider />
      <Button onClick={handlePersonalSign}>Personal sign</Button>
      <Button onClick={handleSignTypedData}>Sign typed data</Button>
      <Divider />
      <Button onClick={handleSendLegacyTransaction}>Send legacy transaction</Button>
      <Button onClick={handleSendSponsoredTransaction}>Send sponsored transaction</Button>
      <Divider />
      <Button onClick={handleValidateSponsorTransaction}>Validate sponsored transaction</Button>
      <Button onClick={handleGetUserProfile}>Get user profile</Button>
      <Button onClick={handleGetBackupClientShard}>Get backup shard</Button>
    </div>
  )
}

export default KeygenTestPage
