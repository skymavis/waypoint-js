# Ronin Waypoint Web SDK

## Introduction

In this guide, you will learn how to integrate the Ronin Waypoint Web SDK into your application. The Ronin Waypoint allows developers to implement features such as player authorization, account creation, and in-app wallet interactions seamlessly in mobile and desktop games. By the end of this guide, you will have a working integration with Ronin Waypoint in your web application.

### Prerequisites

Before you begin, ensure you have the following:
- An app created in the [Developer Console](https://developers.skymavis.com/console/) to obtain your app ID.
- Permission to use the Ronin Waypoint service, which can be requested via Developer Console > your app > App Permission > Ronin Waypoint > Request Access.

For more details, refer to the [Ronin Waypoint documentation](https://docs.skymavis.com/mavis/mavis-id/guides/get-started).

## Step 1: Installing the SDK

First, you need to install the Ronin Waypoint SDK into your project. You can install it using npm, yarn, or pnpm:

```bash
# npm
npm install @sky-mavis/waypoint

# yarn
yarn add @sky-mavis/waypoint

# pnpm
pnpm install @sky-mavis/waypoint
```

## Step 2: Initializing the SDK

Once the SDK is installed, you need to initialize it by creating a wallet provider. This will allow you to interact with the Ronin Waypoint services.

```javascript
import { RoninWaypointWallet } from "@sky-mavis/waypoint";

const provider = RoninWaypointWallet.create({
  clientId: "<REGISTERED_APPLICATION_ID>",  // Replace with your actual app ID
  chainId: chainId,  // Specify the appropriate chain ID
});
```

### Explanation

- **`clientId`:** This is your app ID obtained from the Developer Console.
- **`chainId`:** The chain ID for the network you want to interact with.

## Step 3: Authorizing a User (Optional)

**Note:** If you have a backend system, you can use this method to authorize a user. However, if your application only requires interaction with a web3 wallet, you may skip this step.

To allow users to authorize with Ronin Waypoint, use the following code snippet:

```javascript
import { authorize } from "@sky-mavis/waypoint";

const result = await authorize({
  clientId: "<REGISTERED_APPLICATION_ID>",  // Replace with your actual client ID
  /* redirectUrl: "http://localhost/authorize/waypoint" // If the application want the redirect authorize */
});

console.debug("Authorized:", result);
```

### Explanation
- **`authorize`:** This function initiates the authorization process, allowing users to log in or connect their wallet.
- **`clientId`:** Replace this with your actual client ID.

## Step 4: Interacting with the Wallet

The Ronin Waypoint SDK is compatible with various JavaScript Ethereum interfaces. Below are examples of how to use it with popular libraries:

### Usage with `ethers.js` (v5)

```javascript
import * as ethers from "ethers";

const provider = new ethers.providers.Web3Provider(provider);
```

### Usage with `web3.js`

```javascript
import Web3 from "web3";

const web3 = new Web3(provider);
```

### Usage with `viem`

```javascript
import { createWalletClient, custom } from "viem";
import { saigon } from "viem/chains";

const walletClient = createWalletClient({ chain: saigon, transport: custom(provider) });
```

### Standalone Usage

You can also use the SDK for standalone wallet operations:

```javascript
const accounts = await provider.request<string[]>({ method: "eth_requestAccounts" });

if (accounts.length) {
  const balance = await provider.request<string>({
    method: "eth_getBalance",
    params: [accounts[0], "latest"]
  });
  console.log("Account Balance:", balance);
}
```

## Step 5: Testing and Verification

To verify that your integration is working, test the functionality in your application by authorizing users and interacting with their wallets. You can also explore the [playground source code](https://github.com/skymavis/waypoint-js/tree/main/apps/playground) for full use cases and examples.

## Conclusion

You have successfully integrated the Ronin Waypoint Web SDK into your application. This guide provided you with the essential steps to get started. For more advanced features and utilities, stay tuned for updates as additional functionalities, such as `WagmiConnector` and standalone utilities, are coming soon.
