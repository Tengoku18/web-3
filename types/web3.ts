/**
 * Web3 TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the Wallet Connection Dashboard application.
 */

import type { BrowserProvider, JsonRpcSigner } from "ethers";

/**
 * Supported Ethereum networks with their chain IDs
 * Using hexadecimal format as required by MetaMask RPC methods
 */
export enum ChainId {
  MAINNET = "0x1",
  SEPOLIA = "0xaa36a7",
  GOERLI = "0x5",
  POLYGON = "0x89",
  ARBITRUM = "0xa4b1",
}

/**
 * Human-readable network names mapped to chain IDs
 */
export const NETWORK_NAMES: Record<string, string> = {
  [ChainId.MAINNET]: "Ethereum Mainnet",
  [ChainId.SEPOLIA]: "Sepolia Testnet",
  [ChainId.GOERLI]: "Goerli Testnet",
  [ChainId.POLYGON]: "Polygon Mainnet",
  [ChainId.ARBITRUM]: "Arbitrum One",
};

/**
 * Network configuration for adding chains to MetaMask
 */
export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

/**
 * Sepolia network configuration for wallet_addEthereumChain
 */
export const SEPOLIA_CONFIG: NetworkConfig = {
  chainId: ChainId.SEPOLIA,
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.infura.io/v3/"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

/**
 * Wallet connection state interface
 * Represents the current state of the user's wallet connection
 */
export interface WalletState {
  /** Whether the wallet is currently connected */
  isConnected: boolean;
  /** The connected wallet address (null if disconnected) */
  address: string | null;
  /** Current chain ID in hexadecimal format */
  chainId: string | null;
  /** ETH balance formatted as a string */
  balance: string | null;
  /** Whether a connection/operation is in progress */
  isLoading: boolean;
  /** Current error message (null if no error) */
  error: string | null;
}

/**
 * Initial wallet state for React state initialization
 */
export const INITIAL_WALLET_STATE: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  isLoading: false,
  error: null,
};

/**
 * Web3 provider state for managing ethers.js instances
 */
export interface Web3ProviderState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

/**
 * Toast notification types for UI feedback
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * MetaMask error codes for specific error handling
 * Reference: https://docs.metamask.io/wallet/reference/json-rpc-api/
 */
export enum MetaMaskErrorCode {
  USER_REJECTED = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
  UNRECOGNIZED_CHAIN = 4902,
}

/**
 * Custom error interface for Web3 operations
 */
export interface Web3Error {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Ethereum provider interface (window.ethereum)
 * Extends the basic provider with MetaMask-specific methods
 */
export interface EthereumProvider {
  isMetaMask?: boolean;
  request: <T = unknown>(args: { method: string; params?: unknown[] }) => Promise<T>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners?: (event: string) => void;
}

/**
 * Extend the global Window interface to include ethereum
 */
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Props interface for WalletConnectButton component
 */
export interface WalletConnectButtonProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  isConnected: boolean;
  isLoading: boolean;
  address: string | null;
}

/**
 * Props interface for AccountInfo component
 */
export interface AccountInfoProps {
  address: string | null;
  balance: string | null;
  isLoading: boolean;
}

/**
 * Props interface for NetworkStatus component
 */
export interface NetworkStatusProps {
  chainId: string | null;
  onSwitchNetwork: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Props interface for Toast component
 */
export interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * Transaction status states
 * Represents the lifecycle of an Ethereum transaction
 */
export type TransactionStatus =
  | "idle"      // No transaction in progress
  | "sending"   // User is signing in MetaMask
  | "pending"   // Transaction submitted, waiting for confirmation
  | "confirmed" // Transaction confirmed on chain
  | "failed";   // Transaction failed or rejected

/**
 * Transaction state interface
 * Tracks the current state of a transaction operation
 */
export interface TransactionState {
  status: TransactionStatus;
  hash: string | null;
  error: string | null;
}

/**
 * Initial transaction state
 */
export const INITIAL_TRANSACTION_STATE: TransactionState = {
  status: "idle",
  hash: null,
  error: null,
};

/**
 * Transaction form data interface
 */
export interface TransactionFormData {
  recipient: string;
  amount: string;
}

/**
 * Props interface for SendTransaction component
 */
export interface SendTransactionProps {
  isConnected: boolean;
  onTransactionComplete?: () => void;
}
