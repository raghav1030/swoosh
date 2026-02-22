
# Swoosh

A multi-chain Chrome extension wallet built for educational purposes.

Swoosh is designed to serve as a practical reference implementation for building non-custodial Hierarchical Deterministic (HD) wallets. It implements cross-chain key derivation (EVM & SVM), local storage encryption, and leverages the new `@solana/kit` (Web3.js v2) alongside `ethers` v6.

## Scope & Motivation

The primary goal of this project is to demystify wallet infrastructure. Rather than relying on managed wallet-as-a-service SDKs, Swoosh builds the cryptography, state management, and RPC networking from the ground up.

Key learning objectives covered in this repository:

- Generating and encrypting BIP-39 mnemonic phrases locally.
- Implementing BIP-44 derivation paths for multiple blockchains.
- Migrating from Solana's legacy connection classes to the composable `@solana/kit` architecture.
- Managing Chrome Extension state and background sync via `@crxjs/vite-plugin`.

## Tech Stack Highlights

- **Build:** Vite + TypeScript + CRXJS (for modern extension bundling).
- **State & Data:** Zustand (persistent state) + React Query (caching RPC calls).
- **Solana:** `@solana/kit` & `@solana-program/system` (Web3.js v2).
- **Ethereum:** `ethers` (v6).
- **Cryptography:** `bip39` (seed generation), `ed25519-hd-key` & `tweetnacl` (SVM keypairs), `crypto-js` (AES-256 local storage encryption).
- **UI:** Tailwind CSS v4, Radix UI, Framer Motion.

## Architecture

### Hierarchical Deterministic (HD) Wallets

Swoosh operates as a standard HD wallet. A single 12-word recovery phrase acts as the root entropy, allowing the generation of infinite keypairs across multiple chains without needing to back up multiple private keys.

The generation flow follows industry standards (BIP-32, BIP-39, BIP-44):

1. **Entropy -> Mnemonic:** Generated via `bip39`.
2. **Mnemonic -> Seed:** Converted to a binary seed.
3. **Seed -> Child Keys:** Derived using chain-specific paths:
   - **Solana (Ed25519):** `m/44'/501'/accountIndex'/0'`
   - **Ethereum (Secp256k1):** `m/44'/60'/0'/0/accountIndex`

By incrementing the `accountIndex`, the wallet generates new isolated addresses deterministically.

### RPC Integration & Native Parsing

The wallet communicates directly with public RPC nodes to fetch balances and broadcast transactions.

**Solana (`api.devnet.solana.com`)**
We utilize the tree-shakeable `@solana/kit`. Instead of legacy classes, transactions are built using the functional `pipe` architecture (`createTransactionMessage` -> `appendTransactionMessageInstructions` -> `signTransactionMessageWithSigners`). Transaction history is parsed natively by fetching `getSignaturesForAddress`, decoding the transaction meta, and calculating the delta between `preBalances` and `postBalances`.

**Ethereum (`ethereum-sepolia-rpc`)**
Uses the `JsonRpcProvider` from `ethers` v6 for standard balance fetching and value transfers.

### Security Posture

- **No Telemetry:** No user data or analytics are tracked.
- **Local Execution:** Mnemonic generation and transaction signing happen entirely client-side.
- **Encrypted Storage:** The root seed is encrypted via `crypto-js` (AES) using the user's password before being committed to `chrome.storage.local`.

## Local Development

Ensure you have Node.js (v18+) installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```
