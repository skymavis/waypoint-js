# @sky-mavis/headless

A headless client library for Sky Mavis Waypoint that provides programmatic access to **Ronin MPC wallet operations** without requiring any interface.

## Overview

This library provides two distinct versions for interacting with Ronin MPC wallets:

- **V1 (Recovery Password)** - MPC model allowing user client shard to be encrypted with user-recovery password and stored securely in MPC server
- **V2 (Passwordless)** - MPC model allowing user client shard to be stored securely in isolated compute environments without user-recovery password

## Installation

```bash
npm install @sky-mavis/headless
# or
yarn add @sky-mavis/headless
# or
pnpm add @sky-mavis/headless
```

---

## V1 - Recovery Password

### Overview

User client shard is encrypted with user-recovery password and stored securely in MPC server.

### Features

- Encrypted client shard with user-recovery password
- Secure storage in MPC server
- Full wallet interaction capabilities

### Initialization

```typescript
import { HeadlessCoreFactory, PreferMethod } from '@sky-mavis/headless'
import { ronin } from 'viem/chains'

// Initialize V1 core
const v1Core = HeadlessCoreFactory.create({
  chain: ronin,
  preferMethod: PreferMethod.RecoveryPassword,
  waypointToken: 'your-waypoint-token',
  serviceEnv: 'prod'
})
```

### Quick Start

```typescript
const userRecoveryPassword = 'user-recovery-password'

// Generate MPC key and get client shard
const clientShard = await v1Core.genMpc()

// Backup encrypted client shard to MPC server
await v1Core.backupClientShard(userRecoveryPassword)

// Save client shard to local storage
localStorage.setItem('v1_client_shard', clientShard)

// Use the wallet
const address = v1Core.getAddress()
const signature = await v1Core.signMessage('Hello Ronin!')
```

### Configuration Options

**Note:** The `clientShard` parameter refers to an **already decrypted client shard**.

```typescript
interface V1Options {
  chain: Chain                    // viem Chain object (ronin, saigon, etc.)
  preferMethod: PreferMethod.RecoveryPassword
  waypointToken?: string         // Optional: Waypoint authentication token
  clientShard?: string           // Optional: Decrypted client shard (if already have one)
  serviceEnv?: 'prod' | 'stag'   // Optional: Service environment (default: 'prod')
  wasmUrl?: string               // Optional: Custom WASM URL
}
```

### Core Methods

#### Setup & Key Management
- `genMpc()` - Generate MPC key and return client shard
- `getUserProfile()` - Get user profile information
- `getAddress()` - Get wallet address from client shard
- `isSignable()` - Check if client can sign transactions
- `setClientShard(clientShard: string)` - Set client shard in core

#### Encryption & Backup Operations
- `encryptClientShard(userRecoveryPassword: string)` - Encrypt client shard with user-recovery password
- `decryptClientShard(encryptedShard: string, userRecoveryPassword: string)` - Decrypt encrypted client shard with user-recovery password
- `backupClientShard(userRecoveryPassword: string)` - Backup encrypted client shard to MPC server
- `getBackupClientShard()` - Get backup client shard from MPC server

#### Signing Operations
- `signMessage(message: SignableMessage)` - Sign message with client shard
- `signTypedData(typedData: TypedDataDefinition | string)` - Sign structured data (EIP-712)

#### Transaction Operations
- `sendTransaction(transaction: TransactionParams)` - Send transaction on Ronin network
- `validateSponsorTx(transaction: TransactionParams)` - Validate sponsored transaction

### Complete Examples

#### New User (Key Generation)

```typescript
async function v1NewUserExample() {
    try {
    // Generate MPC key and get client shard
    const clientShard = await v1Core.genMpc()
    
    if (!v1Core.isSignable()) {
      throw new Error('Wallet not ready for signing')
    }

    const address = v1Core.getAddress()
    console.log('Wallet Address:', address)

    // Backup encrypted shard to server
    const userRecoveryPassword = 'user-recovery-password'
    await v1Core.backupClientShard(userRecoveryPassword)
    
    // Save client shard to local storage
    localStorage.setItem('v1_client_shard', clientShard)

    // Sign message
    const message: SignableMessage = 'New user transaction'
    const signature = await v1Core.signMessage(message)
    console.log('Signature:', signature)

    // Send transaction
    const transaction: TransactionParams = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
      data: '0x'
    }
    
    const txResult = await v1Core.sendTransaction(transaction)
    console.log('Transaction Hash:', txResult.txHash)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Existing User (Recovery from Backup)

```typescript
async function v1ExistingUserExample() {
  const userRecoveryPassword = 'user-recovery-password'
  
  try {
    // Option 1: Use stored client shard if available
    let clientShard = localStorage.getItem('v1_client_shard')
    
    // Option 2: Pull backup key from server and decrypt if no local storage
    if (!clientShard) {
      const backupResult = await v1Core.getBackupClientShard()
      clientShard = await v1Core.decryptClientShard(backupResult.key, userRecoveryPassword)
      console.log('Pulled backup from server and decrypted')
      
      // Save client shard for future use
      localStorage.setItem('v1_client_shard', clientShard)
    } else {
      // Set existing client shard in core
      v1Core.setClientShard(clientShard)
    }
    
    const address = v1Core.getAddress()
    console.log('Wallet Address:', address)

    // Sign message
    const message: SignableMessage = 'Existing user transaction'
    const signature = await v1Core.signMessage(message)
    console.log('Signature:', signature)

    // Send transaction
    const transaction: TransactionParams = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
      data: '0x'
    }
    
    const txResult = await v1Core.sendTransaction(transaction)
    console.log('Transaction Hash:', txResult.txHash)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## V2 - Passwordless

### Overview

User client shard is stored securely in isolated compute environments without user-recovery password.

### Features

- Secure storage in isolated compute environments
- Direct wallet interaction without any password
- Migration support from V1

### Initialization

```typescript
import { HeadlessCoreFactory, PreferMethod } from '@sky-mavis/headless'
import { ronin } from 'viem/chains'

// Initialize V2 core
const v2Core = HeadlessCoreFactory.create({
  chain: ronin,
  preferMethod: PreferMethod.Passwordless,
  waypointToken: 'your-waypoint-token',
  serviceEnv: 'prod'
})
```

### Quick Start

```typescript
// Generate passwordless key
await v2Core.genMpc()

// Get user profile
const profile = await v2Core.getUserProfile()

// Use the wallet
const address = v2Core.getAddress()
const signature = await v2Core.signMessage('Hello Ronin!')
```

### Configuration Options

```typescript
interface V2Options {
  chain: Chain                    // viem Chain object (ronin, saigon, etc.)
  preferMethod: PreferMethod.Passwordless
  waypointToken?: string         // Optional: Waypoint authentication token
  clientShard?: string           // Optional: Decrypted client shard got from existing V1 wallet
  serviceEnv?: 'prod' | 'stag'   // Optional: Service environment (default: 'prod')
}
```

### Core Methods

#### Setup & Authentication
- `genMpc()` - Generate passwordless key in isolated compute environment
- `getUserProfile()` - Get user profile (direct authentication)
- `getAddress()` - Get wallet address
- `isSignable()` - Check if client can sign transactions

#### Signing Operations
- `signMessage(message: SignableMessage)` - Sign message with direct key access
- `signTypedData(typedData: TypedDataDefinition | string)` - Sign structured data (EIP-712)

#### Transaction Operations
- `sendTransaction(transaction: TransactionParams)` - Send transaction on Ronin network
- `validateSponsorTx(transaction: TransactionParams)` - Validate sponsored transaction

#### Migration Operations
- `migrateShardFromPassword(clientShard?: string)` - Migrate from V1 password-based key decryption

### Complete Examples

#### New User
```typescript
async function v2NewUser() {
  try {
    // Generate passwordless key
    await v2Core.genMpc()
    
    const profile = await v2Core.getUserProfile()
    const address = v2Core.getAddress()
    
    const signature = await v2Core.signMessage('Hello Ronin!')
    
    const txResult = await v2Core.sendTransaction({
      to: '0x1234567890123456789012345678901234567890',
      value: '2000000000000000000',
      data: '0x'
    })
    
    console.log('Transaction Hash:', txResult.txHash)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Existing User
```typescript
async function v2ExistingUser() {
  try {
    const profile = await v2Core.getUserProfile()
    
    if (!profile.has_support_passwordless) {
      console.log('Use migrateShardFromPassword() to migrate from V1')
      // See Migration section below for complete guide
      return
    }
    
    const address = v2Core.getAddress()
    const signature = await v2Core.signMessage('Hello Ronin!')
    
    const txResult = await v2Core.sendTransaction({
      to: '0x1234567890123456789012345678901234567890',
      value: '1500000000000000000',
      data: '0x'
    })
    
    console.log('Transaction Hash:', txResult.txHash)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Migration from V1 to V2

### Overview

Migrate existing V1 wallet to V2 wallet while maintaining the same wallet address.

### Migration Process

```typescript
import { HeadlessCoreFactory, PreferMethod } from '@sky-mavis/headless'
import { ronin } from 'viem/chains'

async function migrateV1ToV2() {
  const v1ClientShard = 'your-v1-client-shard'

  try {
    // Migrate from V1 to V2 using v2Core
    const migrationResult = await v2Core.migrateShardFromPassword(v1ClientShard)

    console.log('Migration completed')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}
```

---

## TypeScript Support

Full TypeScript support with type-safe cores:

```typescript
import { HeadlessCoreFactory, PreferMethod } from '@sky-mavis/headless'
import { ronin } from 'viem/chains'

// V1 core
const v1Core = HeadlessCoreFactory.create({
  chain: ronin,
  preferMethod: PreferMethod.RecoveryPassword,
  waypointToken: 'your-waypoint-token',
  clientShard: 'decrypted-client-shard',
  serviceEnv: 'prod'
  //...v1Opts
})

// V2 core  
const v2Core = HeadlessCoreFactory.create({
  chain: ronin,
  preferMethod: PreferMethod.Passwordless,
  waypointToken: 'your-waypoint-token',
  serviceEnv: 'prod'
  //...v2Opts
})
```

## License

MIT

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/skymavis/waypoint-js).
