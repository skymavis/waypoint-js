# Deposit SDK

The Deposit SDK provides a simple way to integrate the onramp service into your application efficiently.

This feature allows users buy cryptocurrency through multiple service providers like Transak, Moonpay, Ramp, and Onmeta.

## Features

Onramp service: The Deposit SDK allows users to buy cryptocurrency without leaving your application.

## Prerequisites

Permission to use the Sky Mavis Account service. For more information, see [Get started](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#steps).

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
import { Deposit } from '@sky-mavis/waypoint/deposit';

const deposit = new Deposit({
  clientId: '<client_id>',
  redirectUri: '<redirect_uri>',
})
```

Parameters for the `Deposit` class:

| Field | Required? | Description |
| --- | --- | --- |
| `clientId` | Required | The client ID from the Developer Console. For more information, see [Waypoint service settings](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#steps).|
| `redirectUri` | Optional | Equivalent to the **REDIRECT URI** configured in [Waypoint service settings](https://docs.skymavis.com/mavis/ronin-waypoint/guides/get-started#step-3-configure-ronin-waypoint-settings). Default is `window.location.origin`. |
| `theme` | Optional | `light` or `dark`. |

## Usage

In your application, you can use the `deposit` object to call the `start` method to open the deposit popup modal.

```typescript
deposit.start({
  walletAddress: '<wallet_address>',
  fiatCurrency: '<fiat_currency>',
  cryptoCurrency: '<crypto_currency>',
})
```

 To start the deposit process, call the `start` method with the following pre-filled fields as parameters:

| Field | Required? | Description |
| --- | --- | --- |
| `walletAddress` | Optional | The user's wallet address. |
| `fiatCurrency` | Optional | The fiat currency to convert to cryptocurrency. |
| `cryptoCurrency` | Optional | The cryptocurrency to deposit. |

Returns a `Promise` that resolves with the transaction details when the deposit is successful.

| Field            | Type     | Description                         |
|------------------|----------|-------------------------------------|
| `provider`       | string   | The provider used for the transaction. |
| `transactionHash`| string   | The hash of the transaction.        |
| `fiatCurrency`   | string   | The fiat currency used in the transaction. |
| `cryptoCurrency` | string   | The cryptocurrency used in the transaction. |
| `fiatAmount`     | number   | The amount of fiat currency involved in the transaction. |
| `cryptoAmount`   | number   | The amount of cryptocurrency involved in the transaction. |

If the deposit is unsuccessful, the `Promise` will reject with an error object.

| Field      | Type   | Description                          |
|------------|--------|--------------------------------------|
| `code`       | number  | The error code indicating the type of error. |
| `message`     | string  | The reason for the error or cancellation.     |

## See also

If you want to know more about the guidelines and best practices for using the Deposit SDK, see [Deposit SDK guidelines](https://docs.skymavis.com/mavis/ronin-waypoint/reference/web-sdk#onramp-service).
