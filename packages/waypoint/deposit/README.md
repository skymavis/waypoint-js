# Deposit SDK

The Deposit SDK provides a simple way to integrate the onramp service into your application efficiently.

This feature allows users buy cryptocurrency through multiple service providers like Transak, Moonpay, Ramp, Onmeta or Onramper.

## Features

Onramp service: The Deposit SDK allows users to buy cryptocurrency without leaving your application.

## Prerequisites

Permission to use the Sky Mavis Waypoint service. For more information, see [Get started](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#steps).

## Setup

### Installation

```bash
npm install @sky-mavis/waypoint
# or
yarn add @sky-mavis/waypoint
# or
pnpm add @sky-mavis/waypoint
```

### Initialization

```typescript
import { Deposit } from '@sky-mavis/waypoint/deposit'

const deposit = new Deposit({
  clientId: '<client_id>',
  redirectUri: '<redirect_uri>',
})
```

Parameters for the `Deposit` class:

| Field             | Required? | Description                                                                                                                                                               |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientId`        | Required  | The client ID from the Developer Console. For more information, see [Waypoint service settings](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#steps). |
| `redirectUri`     | Required  | The redirect URI configured in [Waypoint service settings](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#step-3-configure-ronin-waypoint-settings).   |
| `waypointOrigin`  | Optional  | The Waypoint service origin URL. Default is the production Ronin Waypoint origin.                                                                                         |
| `origin`          | Optional  | The origin configured in [Waypoint service settings](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#step-3-configure-ronin-waypoint-settings).         |
| `environment`     | Optional  | `development` or `production`.                                                                                                                                            |
| `theme`           | Optional  | `light` or `dark`.                                                                                                                                                        |
| `onramperOptions` | Optional  | Configuration options for Onramper provider. See [Onramper Options](#onramper-options).                                                                                   |

#### Onramper Options

| Field                   | Type    | Description                           |
| ----------------------- | ------- | ------------------------------------- |
| `references`            | object  | Additional references for the onramp. |
| `references.swapAction` | string  | Identifier for the swap action.       |
| `redirectAtCheckout`    | boolean | Whether to redirect after checkout.   |

## Usage

### Starting the Deposit Process

In your application, you can use the `deposit` object to call the `start` method to open the deposit popup modal.

```typescript
const result = await deposit.start({
  walletAddress: '<wallet_address>',
  fiatCurrency: '<fiat_currency>',
})
```

To start the deposit process, call the `start` method with the following optional parameters:

| Field                | Type   | Required? | Description                                     |
| -------------------- | ------ | --------- | ----------------------------------------------- |
| `email`              | string | Optional  | The user's email address.                       |
| `walletAddress`      | string | Optional  | The user's wallet address.                      |
| `fiatCurrency`       | string | Optional  | The fiat currency to convert to cryptocurrency. |
| `fiatAmount`         | number | Optional  | The amount of fiat currency.                    |
| `onramperParams`     | object | Optional  | Onramper-specific parameters.                   |
| `roninDepositParams` | object | Optional  | Ronin deposit-specific parameters.              |

#### Onramper Parameters

| Field            | Type   | Description                                                                                               |
| ---------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `networkWallets` | object | Wallet addresses for different networks (ronin, ethereum, bsc, polygon, arbitrum, base, solana).          |
| `cryptoCurrency` | string | The cryptocurrency to deposit based on [Onramper ID](https://docs.onramper.com/docs/crypto-asset-support) |

#### Ronin Deposit Parameters

| Field            | Type   | Description                                  |
| ---------------- | ------ | -------------------------------------------- |
| `walletAddress`  | string | The user's wallet address for Ronin network. |
| `cryptoCurrency` | string | The cryptocurrency to deposit.               |

### Success Response

Returns a `Promise` that resolves with the transaction details when the deposit is successful.

| Field             | Type   | Description                                               |
| ----------------- | ------ | --------------------------------------------------------- |
| `provider`        | string | The provider used for the transaction.                    |
| `transactionHash` | string | The hash of the transaction.                              |
| `fiatCurrency`    | string | The fiat currency used in the transaction.                |
| `cryptoCurrency`  | string | The cryptocurrency used in the transaction.               |
| `fiatAmount`      | number | The amount of fiat currency involved in the transaction.  |
| `cryptoAmount`    | number | The amount of cryptocurrency involved in the transaction. |

If the deposit is unsuccessful, the `Promise` will reject with an error object.

| Field     | Type   | Description                                  |
| --------- | ------ | -------------------------------------------- |
| `code`    | number | The error code indicating the type of error. |
| `message` | string | The reason for the error or cancellation.    |

### Dry Run

You can use the `dryRun` method to preview the deposit URL without opening a popup. This is useful for debugging, testing, or sharing the deposit URL.

```typescript
const url = deposit.dryRun({
  walletAddress: '<wallet_address>',
  fiatCurrency: '<fiat_currency>',
  ...
})

console.log(url)  // Returns the full URL string that would be opened
```

The `dryRun` method accepts the same parameters as `start` and returns a string containing the complete deposit URL with all query parameters properly encoded.

## Examples

### Basic Usage

```typescript
import { Deposit } from '@sky-mavis/waypoint/deposit';

async function handleDeposit() {
  const deposit = new Deposit({
    clientId: 'your-client-id',
    redirectUri: 'https://yourapp.com/deposit-callback',
  })

  try {
    const result = await deposit.start({
      walletAddress: '0x1234567890123456789012345678901234567890',
      fiatCurrency: 'USD',
      ...
    })

    console.log('Deposit successful:', result)
  } catch (error) {
    console.error('Deposit failed:', error)
  }
}
```

### With Onramper Configuration

```typescript
const deposit = new Deposit({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/deposit-callback',
  theme: 'dark',
  onramperOptions: {
    references: {
      swapAction: 'https://your-swap-link',
    },
  },
})

const result = await deposit.start({
  email: 'user@example.com',
  onramperParams: {
    networkWallets: {
      ronin: '0x1234567890123456789012345678901234567890',
      ethereum: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    },
    cryptoCurrency: 'axs-ronin',
  },
})
```

## Error Handling

```typescript
import { Deposit } from '@sky-mavis/waypoint/deposit'

const deposit = new Deposit({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/deposit-callback',
})

try {
  const result = await deposit.start({
    walletAddress: '0x...',
    fiatCurrency: 'USD',
  })

  console.log('Transaction hash:', result.transactionHash)
} catch (error) {
  console.error(`Error [${error.code}]: ${error.message}`)
}
```

## See also

If you want to know more about the guidelines and best practices for using the Deposit SDK, see [Deposit SDK guidelines](https://docs.skymavis.com/mavis/ronin-waypoint/reference/web-sdk#onramp-service).
