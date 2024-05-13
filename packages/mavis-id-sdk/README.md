# Mavis ID Web3 Provider

Mavis ID Provider [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Compatible Ethereum JavaScript Provider

## Introduction

The Mavis ID Web3 Provider is a JavaScript provider that is compatible with the EIP-1193 standard. It allows developers to interact with the Ronin blockchain using embedded wallet.

## Installation

```bash
npm install @axieinfinity/mavis-id-sdk
```

## Setup

```js
import { MavisIdProvider } from "mavis-id-sdk"

const mavisIdProvider = MavisIdProvider.create({
  clientId: process.env.YOUR_CLIENT_ID,
})
```

## Usage with ethers.js (v5)

```sh
npm install ethers@5
```

```js
import * as ethers from "ethers"

const provider = new ethers.providers.Web3Provider(mavisIdProvider)
```

## Usage with web3.js

```sh
npm install web3
```

```js
import Web3 from "web3"

const web3 = new Web3(mavisIdProvider)
```

## Example

Below are examples written using ethers.js. You can wrap the Mavis ID Provider with your favorite library that is compatible with EIP-1193.

### Request accounts

Before a user can write on the blockchain, they need to request accounts to sign into their wallet. If a user is already registered, this function will return the connected addresses.

```js
const accounts = await provider.send("eth_requestAccounts", [])
```

### Personal Sign

Sign a message.

```js
const signature = await provider.getSigner().signMessage(<your_message>)
```

### Sign Typed Data V4

Sign data according to the Typed Data Signing Standard [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

```js
const signature = await provider
      .getSigner()
      ._signTypedData(<your_domains>, <your_types>, <your_values>)
```

### Send transaction

Transfer token.

```js
const value = 2 // 2 RON
const txData = await provider.getSigner().sendTransaction({ to: <your_address>, value})
```
