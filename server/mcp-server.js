/**
 * AgentFi MCP Server
 * 
 * This is a standalone MCP (Model Context Protocol) server that gives
 * AI coding assistants (VS Code Copilot, Cursor, Claude Code, etc.)
 * access to WDK wallet capabilities.
 * 
 * Setup:
 *   1. Clone https://github.com/tetherto/wdk-mcp-toolkit.git
 *   2. Follow setup at: https://docs.wdk.tether.io/ai/mcp-toolkit/get-started
 *   3. Configure .vscode/mcp.json with your seed phrase (see below)
 * 
 * The MCP Toolkit provides 35 built-in tools including:
 *   - getBalance, getAddresses, sendTransaction
 *   - swap, bridge, lending (via protocols)
 *   - Token operations, NFT queries
 *   - Transaction history
 * 
 * For more info: https://docs.wdk.tether.io/ai/mcp-toolkit
 */

// This file documents the MCP setup.
// The actual MCP server runs from the wdk-mcp-toolkit repository.
// 
// To integrate with AgentFi:
//
// 1. Clone the WDK MCP Toolkit:
//    git clone https://github.com/tetherto/wdk-mcp-toolkit.git
//    cd wdk-mcp-toolkit
//    npm install
//    npm run setup
//
// 2. The setup wizard will:
//    - Ask for your BIP-39 seed phrase
//    - Generate .vscode/mcp.json
//    - Install dependencies
//
// 3. Open in VS Code and start the MCP server
//
// 4. Your AI assistant can now:
//    - "What's my BNB balance?"
//    - "Send 0.1 BNB to 0x..."
//    - "Show my transaction history"
//    - "Swap 10 USDT for BNB"

console.log('AgentFi MCP Server');
console.log('==================');
console.log('');
console.log('To run the MCP server for AI agent wallet access:');
console.log('');
console.log('  1. git clone https://github.com/tetherto/wdk-mcp-toolkit.git');
console.log('  2. cd wdk-mcp-toolkit && npm install && npm run setup');
console.log('  3. Open in VS Code and start from .vscode/mcp.json');
console.log('');
console.log('Docs: https://docs.wdk.tether.io/ai/mcp-toolkit');
