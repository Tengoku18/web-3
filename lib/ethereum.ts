/**
 * Ethereum Helper Library
 *
 * This module provides utility functions for interacting with Ethereum
 * wallets and the blockchain using ethers.js v6.
 *
 * Features:
 * - MetaMask detection and connection
 * - Balance fetching and formatting
 * - Network switching
 * - Address utilities
 */

import {
  BrowserProvider,
  JsonRpcSigner,
  formatEther,
  parseEther,
  isAddress,
  type TransactionResponse,
  type TransactionReceipt,
} from "ethers";
import {
  ChainId,
  NETWORK_NAMES,
  SEPOLIA_CONFIG,
  MetaMaskErrorCode,
  type EthereumProvider,
  type Web3Error,
} from "@/types/web3";

/**
 * Checks if MetaMask is installed in the browser
 *
 * @returns Boolean indicating if MetaMask is available
 *
 * @example
 * if (!isMetaMaskInstalled()) {
 *   showError("Please install MetaMask");
 * }
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum?.isMetaMask);
}

/**
 * Gets the Ethereum provider from window.ethereum
 *
 * @returns The Ethereum provider or null if not available
 */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

/**
 * Creates an ethers.js BrowserProvider from window.ethereum
 *
 * @returns BrowserProvider instance for blockchain interactions
 * @throws Error if MetaMask is not installed
 *
 * @example
 * const provider = getBrowserProvider();
 * const blockNumber = await provider.getBlockNumber();
 */
export function getBrowserProvider(): BrowserProvider {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  return new BrowserProvider(ethereum);
}

/**
 * Connects to MetaMask and returns the signer
 * Prompts the user to connect their wallet if not already connected
 *
 * @returns Object containing provider and signer
 * @throws Error if connection fails or user rejects
 *
 * @example
 * const { provider, signer } = await connectWallet();
 * const address = await signer.getAddress();
 */
export async function connectWallet(): Promise<{
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
}> {
  const provider = getBrowserProvider();

  // Request account access - this prompts MetaMask popup
  await provider.send("eth_requestAccounts", []);

  // Get the signer (represents the connected account)
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

/**
 * Gets the current connected account address
 * Does not prompt for connection - just checks current state
 *
 * @returns Array of connected addresses or empty array
 */
export async function getConnectedAccounts(): Promise<string[]> {
  const ethereum = getEthereumProvider();

  if (!ethereum) return [];

  try {
    const accounts = await ethereum.request<string[]>({
      method: "eth_accounts",
    });
    return accounts || [];
  } catch {
    return [];
  }
}

/**
 * Fetches the ETH balance for a given address
 *
 * @param address - The Ethereum address to check
 * @param provider - Optional BrowserProvider instance
 * @returns Formatted balance string (e.g., "1.2345")
 *
 * @example
 * const balance = await getBalance("0x123...");
 * console.log(`Balance: ${balance} ETH`);
 */
export async function getBalance(
  address: string,
  provider?: BrowserProvider
): Promise<string> {
  const web3Provider = provider || getBrowserProvider();
  const balance = await web3Provider.getBalance(address);

  // Format to ETH and limit to 4 decimal places
  const formattedBalance = formatEther(balance);
  const [whole, decimal] = formattedBalance.split(".");

  if (!decimal) return whole;

  // Limit to 4 decimal places for cleaner display
  return `${whole}.${decimal.slice(0, 4)}`;
}

/**
 * Gets the current chain ID from the connected wallet
 *
 * @returns Chain ID in hexadecimal format (e.g., "0x1" for mainnet)
 * @throws Error if unable to get chain ID
 */
export async function getChainId(): Promise<string> {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const chainId = await ethereum.request<string>({
    method: "eth_chainId",
  });

  return chainId;
}

/**
 * Gets the human-readable network name for a chain ID
 *
 * @param chainId - The chain ID in hexadecimal format
 * @returns Network name or "Unknown Network"
 *
 * @example
 * const name = getNetworkName("0x1"); // "Ethereum Mainnet"
 * const name = getNetworkName("0xaa36a7"); // "Sepolia Testnet"
 */
export function getNetworkName(chainId: string | null): string {
  if (!chainId) return "Unknown Network";

  // Normalize chain ID to lowercase for comparison
  const normalizedChainId = chainId.toLowerCase();

  return NETWORK_NAMES[normalizedChainId] || "Unknown Network";
}

/**
 * Checks if the current network is Sepolia testnet
 *
 * @param chainId - The chain ID to check
 * @returns Boolean indicating if on Sepolia
 */
export function isSepoliaNetwork(chainId: string | null): boolean {
  if (!chainId) return false;
  return chainId.toLowerCase() === ChainId.SEPOLIA.toLowerCase();
}

/**
 * Switches the wallet to Sepolia testnet
 * If Sepolia is not added to MetaMask, attempts to add it first
 *
 * @throws Error if switch fails or user rejects
 *
 * @example
 * try {
 *   await switchToSepolia();
 *   console.log("Successfully switched to Sepolia");
 * } catch (error) {
 *   console.error("Failed to switch network");
 * }
 */
export async function switchToSepolia(): Promise<void> {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // First, try to switch to Sepolia
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ChainId.SEPOLIA }],
    });
  } catch (error) {
    const web3Error = error as Web3Error;

    // If Sepolia is not added to MetaMask, add it
    if (web3Error.code === MetaMaskErrorCode.UNRECOGNIZED_CHAIN) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SEPOLIA_CONFIG],
      });
    } else {
      throw error;
    }
  }
}

/**
 * Truncates an Ethereum address for display
 *
 * @param address - Full Ethereum address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address (e.g., "0x1234...5678")
 *
 * @example
 * const short = truncateAddress("0x1234567890abcdef...");
 * // Returns: "0x1234...cdef"
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return "";

  if (address.length <= startChars + endChars) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Copies text to clipboard
 *
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 *
 * @example
 * await copyToClipboard(walletAddress);
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
}

/**
 * Parses MetaMask/Web3 errors into user-friendly messages
 *
 * @param error - The error object from a failed operation
 * @returns User-friendly error message
 *
 * @example
 * try {
 *   await connectWallet();
 * } catch (error) {
 *   const message = parseWeb3Error(error);
 *   showToast(message, "error");
 * }
 */
export function parseWeb3Error(error: unknown): string {
  if (typeof error === "string") return error;

  const web3Error = error as Web3Error;

  // Handle specific MetaMask error codes
  switch (web3Error.code) {
    case MetaMaskErrorCode.USER_REJECTED:
      return "Connection rejected. Please approve the connection in MetaMask.";

    case MetaMaskErrorCode.UNAUTHORIZED:
      return "Unauthorized. Please connect your wallet first.";

    case MetaMaskErrorCode.UNSUPPORTED_METHOD:
      return "This action is not supported by your wallet.";

    case MetaMaskErrorCode.DISCONNECTED:
      return "Wallet is disconnected. Please reconnect.";

    case MetaMaskErrorCode.CHAIN_DISCONNECTED:
      return "Disconnected from the chain. Please check your network.";

    case MetaMaskErrorCode.UNRECOGNIZED_CHAIN:
      return "Network not recognized. Please add it to your wallet.";

    default:
      // Check if error has a message property
      if (web3Error.message) {
        // Clean up common error message patterns
        if (web3Error.message.includes("user rejected")) {
          return "Request cancelled by user.";
        }
        return web3Error.message;
      }

      return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Sets up event listeners for wallet events
 * Handles account changes, network changes, and disconnections
 *
 * @param handlers - Object containing event handler functions
 * @returns Cleanup function to remove listeners
 *
 * @example
 * const cleanup = setupWalletListeners({
 *   onAccountsChanged: (accounts) => { ... },
 *   onChainChanged: (chainId) => { ... },
 *   onDisconnect: () => { ... }
 * });
 *
 * // Later, cleanup listeners
 * cleanup();
 */
export function setupWalletListeners(handlers: {
  onAccountsChanged?: (accounts: string[]) => void;
  onChainChanged?: (chainId: string) => void;
  onDisconnect?: () => void;
}): () => void {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    return () => {}; // No-op cleanup function
  }

  // Wrapper functions for type safety
  const accountsHandler = (accounts: unknown) => {
    handlers.onAccountsChanged?.(accounts as string[]);
  };

  const chainHandler = (chainId: unknown) => {
    handlers.onChainChanged?.(chainId as string);
  };

  const disconnectHandler = () => {
    handlers.onDisconnect?.();
  };

  // Add event listeners
  ethereum.on("accountsChanged", accountsHandler);
  ethereum.on("chainChanged", chainHandler);
  ethereum.on("disconnect", disconnectHandler);

  // Return cleanup function
  return () => {
    ethereum.removeListener("accountsChanged", accountsHandler);
    ethereum.removeListener("chainChanged", chainHandler);
    ethereum.removeListener("disconnect", disconnectHandler);
  };
}

/**
 * Validates an Ethereum address format
 *
 * @param address - The address string to validate
 * @returns Boolean indicating if the address is valid
 *
 * @example
 * if (!isValidAddress(recipientAddress)) {
 *   showError("Invalid Ethereum address");
 * }
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return isAddress(address);
}

/**
 * Validates ETH amount input
 *
 * @param amount - The amount string to validate
 * @returns Object with isValid boolean and error message if invalid
 *
 * @example
 * const { isValid, error } = validateAmount("1.5");
 * if (!isValid) showError(error);
 */
export function validateAmount(amount: string): { isValid: boolean; error: string | null } {
  if (!amount || amount.trim() === "") {
    return { isValid: false, error: "Amount is required" };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { isValid: false, error: "Invalid amount format" };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  // Check for reasonable precision (18 decimals max for ETH)
  const decimalParts = amount.split(".");
  if (decimalParts[1] && decimalParts[1].length > 18) {
    return { isValid: false, error: "Too many decimal places (max 18)" };
  }

  return { isValid: true, error: null };
}

/**
 * Sends ETH to a recipient address
 *
 * @param recipientAddress - The destination Ethereum address
 * @param amountInEth - The amount of ETH to send as a string
 * @returns Object containing transaction response and wait function
 * @throws Error if transaction fails
 *
 * @example
 * const { tx, wait } = await sendTransaction("0x123...", "0.1");
 * console.log("Transaction hash:", tx.hash);
 * const receipt = await wait();
 * console.log("Confirmed in block:", receipt.blockNumber);
 */
export async function sendTransaction(
  recipientAddress: string,
  amountInEth: string
): Promise<{
  tx: TransactionResponse;
  wait: () => Promise<TransactionReceipt | null>;
}> {
  // Validate inputs
  if (!isValidAddress(recipientAddress)) {
    throw new Error("Invalid recipient address");
  }

  const amountValidation = validateAmount(amountInEth);
  if (!amountValidation.isValid) {
    throw new Error(amountValidation.error || "Invalid amount");
  }

  // Get provider and signer
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();

  // Convert ETH amount to Wei
  const amountInWei = parseEther(amountInEth);

  // Create and send transaction
  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: amountInWei,
  });

  // Return transaction and wait function
  return {
    tx,
    wait: () => tx.wait(),
  };
}

/**
 * Parses transaction-specific errors into user-friendly messages
 *
 * @param error - The error from a failed transaction
 * @returns User-friendly error message
 */
export function parseTransactionError(error: unknown): string {
  const errorObj = error as { code?: string | number; message?: string; reason?: string };

  // Check for user rejection
  if (
    errorObj.code === MetaMaskErrorCode.USER_REJECTED ||
    errorObj.code === "ACTION_REJECTED" ||
    errorObj.message?.includes("user rejected") ||
    errorObj.message?.includes("User denied")
  ) {
    return "Transaction cancelled by user.";
  }

  // Check for insufficient funds
  if (
    errorObj.code === "INSUFFICIENT_FUNDS" ||
    errorObj.message?.includes("insufficient funds") ||
    errorObj.message?.includes("Insufficient funds")
  ) {
    return "Insufficient ETH balance to complete this transaction.";
  }

  // Check for gas estimation errors
  if (errorObj.message?.includes("gas")) {
    return "Failed to estimate gas. The transaction may fail.";
  }

  // Check for nonce errors
  if (errorObj.message?.includes("nonce")) {
    return "Transaction nonce error. Please try again.";
  }

  // Check for network errors
  if (errorObj.message?.includes("network") || errorObj.code === "NETWORK_ERROR") {
    return "Network error. Please check your connection.";
  }

  // Return the reason if available (common in ethers.js)
  if (errorObj.reason) {
    return errorObj.reason;
  }

  // Return the message if available
  if (errorObj.message) {
    // Truncate very long messages
    return errorObj.message.length > 100
      ? errorObj.message.substring(0, 100) + "..."
      : errorObj.message;
  }

  return "Transaction failed. Please try again.";
}

/**
 * Generates Etherscan URL for a transaction on Sepolia
 *
 * @param txHash - The transaction hash
 * @returns Full Etherscan URL for the transaction
 *
 * @example
 * const url = getSepoliaEtherscanTxUrl("0xabc...");
 * // Returns: "https://sepolia.etherscan.io/tx/0xabc..."
 */
export function getSepoliaEtherscanTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}
