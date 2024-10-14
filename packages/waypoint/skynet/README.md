# Skynet SDK

Web3 API provides enhanced functionality and superior performance across key blockchain operations, including Accounts, NFTs, Blocks, Collections, Contracts, and Transactions. Designed with the latest technology, our API offers a seamless experience for developers, enabling efficient and scalable interactions with blockchain networks.

## Prerequisites

- Prepare your api key which found on [Developer Portal](https://developers.skymavis.com/console/applications/)
![CleanShot 2024-10-14 at 11 18 38@2x](https://github.com/user-attachments/assets/5be21680-436c-4d3f-95a3-35668fad2e69)

## Installation

```bash
npm install @sky-mavis/waypoint
# or
yarn add @sky-mavis/waypoint
# or
pnpm add @sky-mavis/waypoint
```

## Usage

```ts
import { Skynet } from "@sky-mavis/waypoint/skynet"

const skynet = new Skynet({
  apiKey: "<your_api_key>"
})

const balance = await skynet.getBalanceFromAddress("0x1234")
```

## Supported APIs

### Accounts

- searchAccountActivities
- getNFTsFromAddress
- getBalanceFromAddress
- getCollectionsFromAddress
- getNFTsFromAddressAndContract
- getBalanceFromAddressAndContract
- getBalancesFromAddressAndContracts
- getTokenTransfersFromAddress
  getTokenTransfersFromAddressAndContract
- getTransitionsFromAddress
- getInternalTransactionTransfersFromAddress

  ### Blocks

- getFinalizedBlockNumber
- getLatestBlockNumber
- getTransactionsByBlockNumber
- getBlockByNumber
- getBlock

  ### Collection

- getNFTOwners
- getNFTTransfers
- getNFTDetails
- refreshNFTMetadata
- refreshNFTMetadataAsync
- getNFTsDetails
- getNFTsFromCollection
- getTotalCollectionFromAddress
- getOwnersFromCollection
- getCollectionTransfers
- getCollectionDetails
- getCollectionsDetails

  ### Contracts

- getContractDetails
- getContractsDetails

  ### Transactions

- getInternalTransactionsFromTransaction
- getTransactionDetails
- getTransactionsDetails
