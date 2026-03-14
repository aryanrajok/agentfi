import { BrowserProvider, formatEther, JsonRpcSigner } from 'ethers';

// ─── Network-aware chain configuration ───
const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';

export const BNB_CHAIN_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [import.meta.env.VITE_BNB_MAINNET_RPC || 'https://bsc-dataseed.binance.org/'],
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
  rpcUrls: [import.meta.env.VITE_BNB_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// Use the configured network
const CHAIN_CONFIG = isMainnet ? BNB_CHAIN_CONFIG : BNB_TESTNET_CONFIG;
export const TARGET_CHAIN_ID = isMainnet ? 56 : 97;

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
 */
export async function connectWallet(): Promise<WalletConnectionResult> {
  if (!isWalletAvailable()) {
    throw new Error('No wallet detected. Please install MetaMask.');
  }

  try {
    const accounts: string[] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const address = accounts[0];

    const chainIdHex: string = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = parseInt(chainIdHex, 16);

    const balanceHex: string = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    const balance = formatEther(BigInt(balanceHex));

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return {
      address,
      chainId,
      signer,
      provider,
      balance: parseFloat(balance).toFixed(4),
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection in MetaMask.');
    }
    if (error.code === -32002) {
      throw new Error('MetaMask is already processing a request. Please check MetaMask and try again.');
    }
    throw new Error(error.message || 'Failed to connect wallet.');
  }
}

/**
 * Switch to the target BNB Chain (mainnet or testnet based on env)
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
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIG],
        });
      } catch {
        throw new Error('Failed to add BNB Chain to wallet.');
      }
    } else if (switchError.code === 4001) {
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
  } catch (error: any) {
    if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
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
 * Get explorer URL for a transaction or address
 */
export function getExplorerUrl(hashOrAddress: string, type: 'tx' | 'address' = 'address'): string {
  const base = isMainnet ? 'https://bscscan.com' : 'https://testnet.bscscan.com';
  return `${base}/${type}/${hashOrAddress}`;
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

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      onDisconnect();
    } else {
      onAccountChange(accounts);
    }
  };

  const handleChainChanged = (chainId: string) => {
    onChainChange(chainId);
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);

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
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
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
    ethereum: any;
  }
}
