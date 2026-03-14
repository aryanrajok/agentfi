/**
 * WDK (Wallet Development Kit) Service
 * 
 * Integrates Tether's WDK for self-custodial wallet management.
 * See: https://docs.wdk.tether.io
 * 
 * This module initializes WDK with EVM (BNB Chain) support and provides
 * wallet creation, balance fetching, and transaction capabilities that
 * AI agents can use through the MCP Toolkit.
 */

// @ts-nocheck — WDK types are still in beta, suppress strict checking
import WDK from '@tetherto/wdk';

const isMainnet = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_NETWORK === 'mainnet'
  : process.env.VITE_NETWORK === 'mainnet';

const BNB_CHAIN_CONFIG = {
  chainId: isMainnet ? 56 : 97,
  rpcUrl: isMainnet
    ? 'https://bsc-dataseed.binance.org/'
    : 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  name: isMainnet ? 'BNB Smart Chain' : 'BNB Smart Chain Testnet',
  symbol: isMainnet ? 'BNB' : 'tBNB',
  explorer: isMainnet ? 'https://bscscan.com' : 'https://testnet.bscscan.com',
};

let wdkInstance: any = null;
let evmWallet: any = null;

/**
 * Initialize WDK with a seed phrase
 * Must be called before using any WDK features.
 * 
 * @param seed - BIP-39 mnemonic seed phrase
 */
export async function initWDK(seed?: string): Promise<void> {
  const seedPhrase = seed || (typeof import.meta !== 'undefined'
    ? import.meta.env?.WDK_SEED
    : process.env.WDK_SEED);

  if (!seedPhrase) {
    console.warn('WDK: No seed phrase provided. WDK features disabled.');
    console.warn('WDK: Set WDK_SEED in your .env file to enable.');
    return;
  }

  try {
    wdkInstance = new WDK();

    await wdkInstance.init({
      seed: seedPhrase,
      password: 'agentfi-dev', // Used to encrypt seed locally
    });

    console.log('WDK: Core initialized successfully');

    // Register EVM wallet for BNB Chain
    // Note: Dynamic import for tree-shaking
    const { WalletManagerEvm } = await import('@tetherto/wdk-wallet-evm');
    
    evmWallet = await wdkInstance.registerWallet('bnb', WalletManagerEvm, {
      chainId: BNB_CHAIN_CONFIG.chainId,
      rpcUrl: BNB_CHAIN_CONFIG.rpcUrl,
    });

    console.log(`WDK: EVM wallet registered for ${BNB_CHAIN_CONFIG.name}`);

    // Get the first wallet address
    const address = await getWDKAddress();
    if (address) {
      console.log(`WDK: Wallet address: ${address}`);
    }
  } catch (error: any) {
    console.error('WDK: Initialization failed:', error.message);
    // WDK is optional — don't crash the app
  }
}

/**
 * Check if WDK is initialized and ready
 */
export function isWDKReady(): boolean {
  return wdkInstance !== null && evmWallet !== null;
}

/**
 * Get the WDK wallet address
 */
export async function getWDKAddress(): Promise<string | null> {
  if (!evmWallet) return null;

  try {
    const addresses = await evmWallet.getAddresses();
    return addresses?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Get wallet balance via WDK
 */
export async function getWDKBalance(): Promise<string> {
  if (!evmWallet) return '0';

  try {
    const balance = await evmWallet.getBalance();
    return balance?.toString() || '0';
  } catch {
    return '0';
  }
}

/**
 * Send a transaction via WDK (self-custodial)
 * AI agents use this through MCP Toolkit
 */
export async function sendWDKTransaction(
  to: string,
  value: string,
  data?: string,
): Promise<string | null> {
  if (!evmWallet) {
    console.error('WDK: Wallet not initialized');
    return null;
  }

  try {
    const txHash = await evmWallet.sendTransaction({
      to,
      value,
      data: data || '0x',
    });

    console.log(`WDK: Transaction sent: ${txHash}`);
    return txHash;
  } catch (error: any) {
    console.error('WDK: Transaction failed:', error.message);
    throw error;
  }
}

/**
 * Get WDK chain configuration
 */
export function getWDKChainConfig() {
  return BNB_CHAIN_CONFIG;
}

/**
 * Get the raw WDK instance (for advanced usage)
 */
export function getWDKInstance() {
  return wdkInstance;
}

/**
 * Get the raw EVM wallet instance (for advanced usage)
 */
export function getWDKEvmWallet() {
  return evmWallet;
}

export default {
  initWDK,
  isWDKReady,
  getWDKAddress,
  getWDKBalance,
  sendWDKTransaction,
  getWDKChainConfig,
  getWDKInstance,
  getWDKEvmWallet,
};
