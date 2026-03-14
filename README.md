# AgentFi — Autonomous DeFi Agent Infrastructure

AgentFi is the coordination layer where **autonomous AI agents** register cryptographic identities, participate in DeFi lending pools, and execute financial actions with **commit-reveal privacy** — trustlessly, fairly, and without human intervention.

Built on **BNB Chain** · Powered by **Tether WDK** · Smart contracts by **OpenZeppelin**

---

## 🏗️ Architecture

```
Frontend (Vite + React + TypeScript)
├── Landing page with live agent feed
├── Dashboard with real wallet data
├── Agent registration (onchain via AgentRegistry.sol)
├── Commit-Reveal UI (onchain via CommitReveal.sol)
├── AFI token rewards (onchain via AFIToken.sol)
└── MetaMask wallet integration (ethers.js)

Smart Contracts (Solidity 0.8.20)
├── AgentRegistry.sol  — Register AI agents with Ed25519 public keys
├── CommitReveal.sol   — Private action submission with hash verification
└── AFIToken.sol       — ERC20 reward token (100M max supply)

WDK Integration
├── @tetherto/wdk — Core wallet SDK
├── @tetherto/wdk-wallet-evm — EVM wallet module
└── @tetherto/wdk-mcp-toolkit — MCP server for AI agent wallet access
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Testnet BNB from [BNB Chain Faucet](https://www.bnbchain.org/en/testnet-faucet)

### Install & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd AgentFi

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your keys (DEPLOYER_PRIVATE_KEY, etc.)

# Start development server
npm run dev
```

### Deploy Smart Contracts

```bash
# 1. Compile contracts
npx hardhat compile

# 2. Set your deployer private key in .env
# DEPLOYER_PRIVATE_KEY=your_private_key_here

# 3. Deploy to BNB Testnet
node scripts/deploy.cjs

# 4. Contracts will auto-update src/data/contracts.json
```

### Deploy to Mainnet

```bash
# Update .env
VITE_NETWORK=mainnet
# Then deploy
node scripts/deploy.cjs
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 8, React 19, TypeScript |
| Styling | Vanilla CSS, Framer Motion |
| State | Zustand |
| Blockchain | ethers.js v6, web3.js v4 |
| Smart Contracts | Solidity 0.8.20, Hardhat 3, OpenZeppelin 5 |
| Wallet SDK | Tether WDK (`@tetherto/wdk`) |
| AI Integration | WDK MCP Toolkit (`@tetherto/wdk-mcp-toolkit`) |
| Network | BNB Smart Chain (Mainnet/Testnet) |

## 🔐 Smart Contracts

### AgentRegistry.sol
- Register agents with Ed25519 public key hashes
- Configurable strategy and max position size
- Reputation system (0–1000)
- Owner-controlled activation/deactivation

### CommitReveal.sol
- Commit-reveal scheme for frontrunning protection
- Configurable commit window (default: 5 blocks)
- Hash verification on reveal
- Full audit trail with events

### AFIToken.sol
- ERC20 reward token with 100M max supply
- Reward accrual for successful actions
- Configurable reward rates
- Claimable rewards system

## 🌐 WDK Integration

AgentFi uses [Tether's Wallet Development Kit (WDK)](https://docs.wdk.tether.io) for:

- **Self-custodial wallets** — Agents hold their own keys
- **Multi-chain support** — Built on WDK's modular architecture
- **MCP Toolkit** — AI agents can interact with wallets via MCP protocol
- **Secure by design** — Stateless, keys never leave user control

## 📁 Project Structure

```
AgentFi/
├── contracts/          # Solidity smart contracts
│   ├── AgentRegistry.sol
│   ├── CommitReveal.sol
│   └── AFIToken.sol
├── scripts/            # Deployment scripts
│   ├── deploy.cjs      # ethers.js deployer
│   └── deployWeb3.cjs  # web3.js deployer
├── src/
│   ├── components/     # Shared UI components
│   ├── data/           # Services, types, contracts config
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── stores/         # Zustand state stores
│   └── styles/         # Additional CSS
├── .env.example        # Environment variable template
├── hardhat.config.cjs  # Hardhat configuration
└── vite.config.ts      # Vite configuration
```

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_NETWORK` | Yes | `testnet` or `mainnet` |
| `VITE_BNB_MAINNET_RPC` | No | Custom mainnet RPC URL |
| `VITE_BNB_TESTNET_RPC` | No | Custom testnet RPC URL |
| `DEPLOYER_PRIVATE_KEY` | For deploy | Deployer wallet private key |
| `WDK_SEED` | For WDK | BIP-39 seed phrase |
| `WDK_INDEXER_API_KEY` | No | WDK Indexer API key |

## 📄 License

MIT License
