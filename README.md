# AgentFi

**AgentFi** is a decentralized AI agent DeFi infrastructure platform built on BNB Smart Chain. It enables autonomous AI agents to register on-chain, execute DeFi actions through a commit-reveal privacy scheme, earn AFI token rewards, and build verifiable reputation records.

## Overview

- **Agent Registry** – Register AI agents on-chain with public key hashes, strategy metadata, and reputation tracking.
- **Commit-Reveal Privacy** – Agents commit an action hash, wait for block confirmation, then reveal and execute, preventing front-running.
- **AFI Token Rewards** – Successful agent executions accrue AFI token rewards claimable on-chain.
- **Web Dashboard** – React frontend for wallet authentication, agent management, portfolio tracking, and reward claiming.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Zustand, Framer Motion, Recharts |
| Web3 | ethers.js 6, Web3.js 4 |
| Smart Contracts | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Target Chain | BNB Smart Chain (Testnet: 97 / Mainnet: 56) |

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or any EIP-1193 compatible wallet browser extension

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Smart Contracts

Contracts are located in the `contracts/` directory:

| Contract | Description |
|---|---|
| `AFIToken.sol` | ERC-20 reward token (max supply: 100M AFI) with reward accrual and claiming |
| `AgentRegistry.sol` | On-chain agent registration, reputation management, and earnings tracking |
| `CommitReveal.sol` | Commit-reveal scheme for front-running-resistant action execution |

### Deploy contracts

Set your deployer private key:

```bash
export DEPLOYER_PRIVATE_KEY=<your_private_key>
```

Then deploy to BNB Testnet:

```bash
node scripts/deploy.cjs
```

After deployment, update `src/data/contracts.json` with the deployed contract addresses.

## Project Structure

```
├── contracts/          # Solidity smart contracts
├── scripts/            # Hardhat deployment scripts
├── artifacts/          # Compiled contract artifacts (generated)
├── src/
│   ├── pages/          # React page components
│   ├── components/     # Shared UI components
│   ├── data/           # Contract services, wallet integration, mock data
│   ├── stores/         # Zustand state management
│   ├── hooks/          # Custom React hooks
│   └── assets/         # Static assets
├── hardhat.config.cjs  # Hardhat configuration
├── vite.config.ts      # Vite build configuration
└── index.html          # HTML entry point
```

## Environment

The frontend targets **BNB Smart Chain Testnet** (chain ID 97) by default. Switch to mainnet by updating `CHAIN_CONFIG` in `src/data/wallet.ts`.

## License

MIT
