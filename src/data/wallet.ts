import { BrowserProvider, formatEther, JsonRpcSigner } from 'ethers';

// Minimal EIP-1193 provider interface
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<string | string[]>;
  on: (event: string, handler: (value: string | string[]) => void) => void;
  removeListener: (event: string, handler: (value: string | string[]) => void) => void;
}

// Helper to check for Web3/EIP-1193 provider errors with a code property
interface ProviderError {
  code: number | string;
  message?: string;
}

function isProviderError(e: unknown): e is ProviderError {
  return typeof e === 'object' && e !== null && 'code' in e;
}

// BNB Chain configuration
export const BNB_CHAIN_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

export const BNB_TESTNET_CONFIG = {
  chainId: '0x61', // 97 in hex
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// Use mainnet for production
const CHAIN_CONFIG = BNB_CHAIN_CONFIG;

export interface WalletConnectionResult {
  address: string;
  chainId: number;
  signer: JsonRpcSigner;
  provider: BrowserProvider;
  balance: string;
}

/**
 * Check if MetaMask or any injected wallet is available
 */
export function isWalletAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask or injected wallet
 * Uses window.ethereum.request DIRECTLY first, then wraps with ethers.js
 */
export async function connectWallet(): Promise<WalletConnectionResult> {
  if (!isWalletAvailable()) {
    throw new Error('No wallet detected. Please install MetaMask.');
  }

  try {
    // Step 1: Request accounts directly via window.ethereum
    // This triggers the MetaMask popup
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const address = accounts[0];

    // Step 2: Get chain ID directly
    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    }) as string;
    const chainId = parseInt(chainIdHex, 16);

    // Step 3: Get balance directly
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }) as string;
    const balance = formatEther(BigInt(balanceHex));

    // Step 4: NOW create ethers provider and signer (after connection is established)
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return {
      address,
      chainId,
      signer,
      provider,
      balance: parseFloat(balance).toFixed(4),
    };
  } catch (error: unknown) {
    if (isProviderError(error) && error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection in MetaMask.');
    }
    if (isProviderError(error) && error.code === -32002) {
      throw new Error('MetaMask is already processing a request. Please check MetaMask and try again.');
    }
    throw new Error(isProviderError(error) && error.message ? error.message : 'Failed to connect wallet.');
  }
}

/**
 * Switch to BNB Chain (or add it if not configured)
 */
export async function switchToBNBChain(): Promise<void> {
  if (!isWalletAvailable()) {
    throw new Error('No wallet detected.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_CONFIG.chainId }],
    });
  } catch (switchError: unknown) {
    // Chain not added - add it
    if (isProviderError(switchError) && switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIG],
        });
      } catch {
        throw new Error('Failed to add BNB Chain to wallet.');
      }
    } else if (isProviderError(switchError) && switchError.code === 4001) {
      throw new Error('Chain switch rejected by user.');
    } else {
      throw new Error('Failed to switch to BNB Chain.');
    }
  }
}

/**
 * Sign an authentication challenge message
 */
export async function signAuthChallenge(signer: JsonRpcSigner): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2, 10);
  const message = `AgentFi Authentication\n\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nSign this message to verify ownership of your wallet. This does not cost any gas.`;

  try {
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error: unknown) {
    if (isProviderError(error) && (error.code === 4001 || error.code === 'ACTION_REJECTED')) {
      throw new Error('Signature rejected by user.');
    }
    throw new Error('Failed to sign authentication challenge.');
  }
}

/**
 * Truncate an address for display: 0x1234...5678
 */
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Listen for wallet events (account change, chain change, disconnect)
 */
export function setupWalletListeners(
  onAccountChange: (accounts: string[]) => void,
  onChainChange: (chainId: string) => void,
  onDisconnect: () => void,
): () => void {
  if (!isWalletAvailable()) return () => {};

  const handleAccountsChanged = (value: string | string[]) => {
    const accounts = Array.isArray(value) ? value : [value];
    if (accounts.length === 0) {
      onDisconnect();
    } else {
      onAccountChange(accounts);
    }
  };

  const handleChainChanged = (value: string | string[]) => {
    const chainId = Array.isArray(value) ? value[0] : value;
    onChainChange(chainId);
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);

  // Return cleanup function
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  };
}

/**
 * Check if already connected (for auto-reconnect)
 */
export async function checkExistingConnection(): Promise<string | null> {
  if (!isWalletAvailable()) return null;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    return null;
  } catch {
    return null;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum: EthereumProvider;
  }
}
