# Skynet SDK

Web3 API provides enhanced functionality and superior performance across key blockchain operations, including Accounts, NFTs, Blocks, Collections, Contracts, and Transactions. Designed with the latest technology, our API offers a seamless experience for developers, enabling efficient and scalable interactions with blockchain networks.

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
  - apiKey
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
