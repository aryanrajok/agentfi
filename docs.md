About WDK
Learn about the Wallet Development Kit and its capabilities

The Wallet Development Kit by Tether (WDK) is Tether's open-source toolkit that empowers humans, machines and AI agents alike to build, deploy and use secure, multi-chain, self-custodial wallets that can be integrated anywhere from the smallest embedded device to any mobile, desktop and server operating system.

A developer-first framework designed for maximum flexibility and scalability, powering anything from consumer wallets to wallet-enabled apps, DeFi integrations (lending, swaps, ...), IoT use cases, and AI agents.

Unlike closed solutions or SaaS-based wallet infrastructure providers, WDK offers zero lock-in and is designed for maximum flexibility and extensibility. It is modular, runs on Bare, Node.js and React-Native, thus can be embedded in a wide variety of environments.

What Problems Does WDK Solve?
The current blockchain ecosystem is highly fragmented, with each blockchain requiring different SDKs, APIs, and integration approaches. This fragmentation creates significant barriers for developers who want to build truly seamless user-experiences that span across any blockchain, environment and use-case.

Traditional wallet development requires months of integration work. Developers must learn different standards, implement contrasting security practices, or rely on closed-source paid solutions which act as gatekeepers.

The Missing AI Foundation
As we move toward a world where humans, machines and AI Agents need to manage digital assets safely, existing solutions fall short. AI agents will require wallets to interact in the financial infrastructure, and WDK wants to lay secure foundation that works for human, AI and IoT use cases. WDK enables trillions of self-custodial wallets.

Why WDK is Different
Cover
Runs Anywhere

Works with Node.js, Bare runtime, mobile (React Native), and future embedded environments

Cover
Modular & Extensible

Pick only the modules you need; extend functionality with custom modules

Cover
Developer-Centric

Clear SDK design, strong TypeScript typing, extensive docs, and ready-to-use starters

Cover
Secure by Design

Stateless and self-custodial architecture ensures keys never leave user control

Cover
Zero Lock-In

Transparent, community-driven, and free to adopt with no vendor lock-in

Cover
Ecosystem-Backed

Maintained and supported by Tether with strong community involvement

What WDK Provides
WDK combines four core components to deliver a complete wallet development solution:

Cover
Modular SDK

Unified APIs for wallet and protocol operations across multiple blockchains

Cover
Indexer API

Reliable blockchain data access for balances, transactions, and historical data

Cover
UI Kits

Reusable React Native components for building wallet interfaces

Cover
Examples & Starters

Production-ready wallet templates and reference implementations

Supported Blockchains & Protocols
WDK natively supports a broad set of blockchains and standards out of the box:

Wallet Modules
DeFi Modules
Blockchain/Module
Support
Bitcoin

✅

Ethereum & EVM

✅

Ethereum ERC-4337

✅

TON

✅

TON Gasless

✅

TRON

✅

TRON Gasfree

✅

Solana

✅

Spark/Lightning

✅

The modular architecture allows new chains, tokens, or protocols to be added by implementing dedicated modules.

Ready to start building? Explore our getting started guide or dive into our SDK documentation.

bild with ai////////////

Start Building
Build with AI
Connect your AI coding assistant to WDK documentation for context-aware code generation, architecture guidance, and debugging help.

WDK documentation is optimized for AI coding assistants. Give your AI tool context about WDK to get accurate code generation, architecture guidance, and debugging help.

There are two ways to provide WDK context to your AI:

Connect via MCP Server - Best experience. Your AI tool can search and query WDK docs in real time.

Connect via Markdown - Works with any AI tool. Feed documentation directly into the context window.

Want to give AI agents wallet access? The MCP Toolkit creates an MCP server that exposes WDK wallets as tools - letting AI agents check balances, send transactions, swap tokens, and more.

Want agents to pay for resources? The x402 guide shows how to use WDK wallets with the x402 protocol for instant, programmatic USD₮ payments over HTTP.

Connect WDK Docs via MCP Server
The WDK documentation is available as an MCP server, giving your AI tool searchable access to all modules, API references, quickstarts, and guides. This works with any tool that supports the Model Context Protocol (MCP).

MCP Server URL:


Copy
https://docs.wallet.tether.io/~gitbook/mcp
Add this server to your AI tool's MCP configuration:

Cursor
Claude Code
Windsurf
GitHub Copilot
Cline
Continue
Config path: ~/.cursor/mcp.json (global) or .cursor/mcp.json (project-level)


Copy
{
  "mcpServers": {
    "wdk-docs": {
      "url": "https://docs.wallet.tether.io/~gitbook/mcp"
    }
  }
}
→ Cursor MCP documentation

The MCP server provides access to published documentation only. If your tool is not listed above, add the MCP server URL (https://docs.wallet.tether.io/~gitbook/mcp) to your tool's MCP configuration - most MCP-compatible tools follow a similar JSON format.

No MCP support? You can feed WDK documentation directly into any AI tool as Markdown. See Connect WDK Docs via Markdown below.

Add WDK Project Rules (Optional)
Project rules give your AI assistant persistent context about WDK conventions, package naming, and common patterns. This is optional but recommended for teams working extensively with WDK.

Copy the rules content below and save it at the file path for your tool.

Rules Content

Copy
# WDK Development Rules

## Package Structure
- All WDK packages are published under the `@tetherto` scope on npm
- Core module: `@tetherto/wdk`
- Wallet modules follow the pattern: `@tetherto/wdk-wallet-<chain>`
  - Examples: `@tetherto/wdk-wallet-evm`, `@tetherto/wdk-wallet-btc`, `@tetherto/wdk-wallet-solana`, `@tetherto/wdk-wallet-ton`, `@tetherto/wdk-wallet-tron`, `@tetherto/wdk-wallet-spark`
- Specialized wallet modules: `@tetherto/wdk-wallet-evm-erc4337`, `@tetherto/wdk-wallet-ton-gasless`, `@tetherto/wdk-wallet-tron-gasfree`
- Protocol modules follow the pattern: `@tetherto/wdk-protocol-<type>-<name>-<chain>`
  - Examples: `@tetherto/wdk-protocol-swap-velora-evm`, `@tetherto/wdk-protocol-bridge-usdt0-evm`, `@tetherto/wdk-protocol-lending-aave-evm`

## Platform Notes
- For Node.js or Bare runtime: Use `@tetherto/wdk` as the orchestrator, then register individual wallet modules
- For React Native: You have two options:
  - Use the React Native provider package for convenience (provides hooks and managed lifecycle)
  - Or use WDK packages directly in the Hermes runtime - this works the same as Node.js integration

## Architecture
- WDK is modular - each blockchain and protocol is a separate npm package
- Wallet modules expose `WalletManager`, `WalletAccount`, and `WalletAccountReadOnly` classes
- `WalletAccount` extends `WalletAccountReadOnly` - it has all read-only methods plus write methods (sign, send)
- All modules follow a consistent pattern: configuration → initialization → usage

## Documentation
- Official docs: https://docs.wallet.tether.io
- For any WDK question, consult the official documentation before making assumptions
- API references, configuration guides, and usage examples are available for every module
Where to Save
AI Coding Assistant
File Path
Notes
Cursor

.cursor/rules/wdk.mdc

Project-level, auto-attached

Claude Code

CLAUDE.md

Place in project root

Windsurf

.windsurf/rules/wdk.md

Project-level rules

GitHub Copilot

.github/copilot-instructions.md

Project-level instructions

Cline

.clinerules

Place in project root

Continue

.continuerules

Place in project root

Connect WDK Docs via Markdown
If your AI tool doesn't support MCP, you can feed WDK documentation directly into the context window using these endpoints:

Endpoint
URL
Description
Page index

docs.wallet.tether.io/llms.txt

Index of all page URLs and titles

Full docs

docs.wallet.tether.io/llms-full.txt

Complete documentation in one file

You can also append .md to any documentation page URL to get the raw Markdown, ready to paste into a chat context window.

Agent Guidelines in WDK Repos
Each WDK package repository includes an AGENTS.md file in its root. This file provides AI agents with context about the project structure, coding conventions, testing patterns, and linting rules.

If your AI tool has access to the WDK source repositories (e.g., via a local clone), it will automatically ingest AGENTS.md for additional context beyond the documentation.

Example Prompt
Here's an example prompt you can use to generate a multichain wallet with WDK. Try it with MCP connected or paste the relevant quickstart docs for best results:


Copy
Create a Node.js app using WDK (@tetherto/wdk) that:
1. Creates a multichain wallet supporting Bitcoin and Polygon
2. Use @tetherto/wdk-wallet-btc for Bitcoin and @tetherto/wdk-wallet-evm for Polygon
3. Generates wallet addresses for both chains
4. Retrieves the balance for each address
5. Use a mnemonic from environment variables

Check the WDK documentation for the correct configuration and initialization pattern.
Tips for Effective AI-Assisted Development
Be specific about the chain. Tell the AI which blockchain you're targeting (e.g., "I'm building on Ethereum using @tetherto/wdk-wallet-evm") so it picks the right module.

Reference the exact package name. Mention the full @tetherto/wdk-* package name in your prompt for more accurate code generation.

Ask the AI to check docs first. Prompt with "Check the WDK documentation before answering" to ensure it uses the MCP-connected docs rather than outdated training data.

Start with a quickstart. Point the AI at the Node.js Quickstart or React Native Quickstart as a working reference before building custom features.

Iterate in steps. Use the AI to scaffold your WDK integration first, then refine module configuration and error handling in follow-up prompts.

mcp toolkit///

MCP Toolkit
Build MCP servers that give AI agents self-custodial WDK wallets

The MCP Toolkit lets AI agents interact with self-custodial WDK wallets. It creates an MCP server that exposes wallet operations (checking balances, sending transactions, swapping tokens, bridging assets, and more) as structured tools that any MCP-compatible AI client can call.

Powered by @tetherto/wdk-mcp-toolkit.

Beta - This package is in active development (v1.0.0-beta.1). APIs may change between releases.


Features
MCP Server Extension - Extends the official @modelcontextprotocol/sdk McpServer with WDK-specific capabilities

Multi-Chain - Support for 13 blockchains out of the box, including EVM chains, Bitcoin, Solana, Spark, TON, and Tron

35 Built-in Tools - Ready-to-use tools for wallets, pricing, indexer queries, swaps, bridges, lending, and fiat on/off-ramps

Human Confirmation - All write operations use MCP elicitations to require explicit user approval before broadcasting transactions

Extensible - Register custom tools alongside built-in ones using standard MCP SDK patterns

Secure by Design - Seed phrases stay local, close() wipes keys from memory, and read/write tool separation lets you control access

Supported Chains
Chain
Identifier
Ethereum

ethereum

Polygon

polygon

Arbitrum

arbitrum

Optimism

optimism

Base

base

Avalanche

avalanche

BNB Chain

bnb

Plasma

plasma

Bitcoin

bitcoin

Solana

solana

Spark

spark

TON

ton

Tron

tron

You can register any blockchain name - the CHAINS constants are for convenience only. For custom chains, register tokens manually with registerToken().


Get Started

Install and run your first MCP server in minutes


Configuration

Wallets, capabilities, tokens, protocols, and custom tools


API Reference

All 35 built-in MCP tools and the WdkMcpServer class

Already using an AI coding assistant? See Build with AI for how to connect WDK docs as context via MCP or Markdown.

https://docs.wdk.tether.io/ai/mcp-toolkit/api-reference
https://docs.wdk.tether.io/overview/about
https://docs.wdk.tether.io/start-building/build-with-ai
https://docs.wdk.tether.io/