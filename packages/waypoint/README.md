# Ronin Waypoint Web SDK

## What is Ronin Waypoint?

[Ronin Waypoint](https://waypoint.roninchain.com) is a service that lets developers use features such as player authorization, account creation, and in-app wallet interaction in mobile and desktop games.

#### Features:

- Creating a wallet without requiring web3/crypto knowledge or downloading an external app
- Recover & access the wallet on different devices with a simple passphrase
- Perform on-chain actions like minting NFTs, sending transactions & signing messages
- Gas sponsoring

## SDK Introduction

The Ronin Waypoint Web SDK lets developers integrate with Ronin Waypoint seamlessly & easily.

- [Head to the playground](https://mavis-id-playground.vercel.app) to experience Ronin Waypoint your way
- [Head to the faucet](https://faucet.roninchain.com) to get your RON on Saigon Testnet

#### Features:

- Authorize user with Ronin Waypoint
- `RoninWaypointWallet` is [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Compatible Ethereum JavaScript Provider
- Interact with any Javascript Ethereum Interface such as `viem`, `ether.js`, `web3js`
- `WagmiConnector` | `WalletgoConnector` is coming soon
- Standalone utilities for game developers (nfts, token balance, token approval, katana swap, ...) is coming soon

## Prerequisites

- Create an app in the [Developer Console](https://developers.skymavis.com/console) to get your client ID.
- Request permission to use the Ronin Waypoint service in the Developer Console, under **your app > App Permission > Sky Mavis Account (OAuth 2.0) > Request Access**.

For more information, see the [documentation](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started).

## Installation

```bash
# npm
npm install @sky-mavis/waypoint

# yarn
yarn add @sky-mavis/waypoint

# pnpm
pnpm install @sky-mavis/waypoint
```

## Initialization

```js
import { RoninWaypointWallet } from "@sky-mavis/waypoint"

const idWalletProvider = RoninWaypointWallet.create({
  clientId: process.env.YOUR_CLIENT_ID,
  chainId: chainId,
})
```

## Authorize user

```js
import { authorize } from "@sky-mavis/waypoint"

const result = await authorize({
  clientId: "0e188f93-b419-4b0f-8df4-0f976da91ee6",
  id.origin: "https://waypoint.roninchain.com",
})

console.debug("🚀 | Authorize Result:", result)
```

## Interact with wallet

**Usage with ethers.js (v5):**

```js
import * as ethers from "ethers"

const provider = new ethers.providers.Web3Provider(idWalletProvider)
```

**Usage with web3.js**

```js
import Web3 from "web3"

const web3 = new Web3(idWalletProvider)
```

**Usage with viem**

```js
import { createWalletClient, custom } from "viem"
import { saigon } from "viem/chains"

const walletClient = createWalletClient({ chain, transport: custom(idWalletProvider) })
```

**Standalone usage**

```js
const accounts = await idWalletProvider.request<string[]>({ method: "eth_requestAccounts" })

if (accounts.length) {
  roninWaypointProvider.request<string>({
    method: "eth_getBalance",
    params: [accounts[0], "latest"]
  })
}
```

## Examples

For complete use cases, see the [playground source code](https://github.com/skymavis/waypoint-js/tree/main/apps/playground).
