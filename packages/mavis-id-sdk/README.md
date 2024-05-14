# Mavis ID SDK

## What is Mavis ID?

The [Mavis ID](https://id.skymavis.com) lets developers use features such as player authorization, account creation, and in-app wallet interaction in mobile and desktop games.

#### Features:

- Creating a wallet without requiring web3/crypto knowledge or downloading an external app
- Recover & access the wallet on different devices with a simple passphrase
- Perform on-chain actions like minting NFTs, sending transactions & signing messages
- Gas sponsoring

## SDK Introduction

The Mavis ID SDK lets developers integrate with Mavis ID seamlessly & easily.

- [Head to the playground](https://mavis-id-playground.vercel.app) to experience Mavis ID your way
- [Head to the faucet](https://faucet.roninchain.com) to get your RON on Saigon Testnet

#### Features:

- `MavisIdProvider` is [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Compatible Ethereum JavaScript Provider
- Interact with any Javascript Ethereum Interface such as `viem`, `ether.js`, `web3js`
- `WagmiConnector` | `WalletgoConnector` is coming soon
- Standalone utilities for game developers (nfts, token balance, token approval, katana swap, ...) is coming soon

## Prerequisites

- Register your application with Sky Mavis to get `YOUR_APP_ID`
- Request permission to use Mavis ID
- Go to Developer Console > your app > App Permission > Mavis ID > Request Access

[Head to the detail guide](https://docs.skymavis.com/placeholder) to acquired `YOUR_APP_ID`

## Installation

npm:

```bash
npm install @sky-mavis/mavis-id-sdk
```

yarn:

```bash
yarn add @sky-mavis/mavis-id-sdk
```

pnpm:

```bash
pnpm install @sky-mavis/mavis-id-sdk
```

## Initialization

```js
import { MavisIdProvider } from "mavis-id-sdk"

const IdProvider = MavisIdProvider.create({
  clientId: process.env.YOUR_APP_ID,
  chainId: chainId,
})
```

Usage with ethers.js (v5):

```js
import * as ethers from "ethers"

const provider = new ethers.providers.Web3Provider(IdProvider)
```

Usage with web3.js

```js
import Web3 from "web3"

const web3 = new Web3(IdProvider)
```

Usage with viem

```js
import { createWalletClient, custom } from "viem"
import { saigon } from "viem/chains"

const viemClient = createWalletClient({ chain, transport: custom(mavisIdProvider) })
```

## Example

[Head to the playground source code](https://github.com/skymavis/mavis-id-js/tree/main/apps/playground) for full use-cases
