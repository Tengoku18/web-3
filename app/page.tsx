"use client";

/**
 * Main Dashboard Page
 *
 * The primary page of the Wallet Connection Dashboard application.
 * Integrates all Web3 functionality including wallet connection,
 * network detection, and account information display.
 *
 * Features:
 * - Wallet connection/disconnection
 * - Real-time balance updates
 * - Network status and switching
 * - Event handling for account and network changes
 * - Error handling with toast notifications
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  isMetaMaskInstalled,
  connectWallet,
  getBalance,
  getChainId,
  switchToSepolia,
  parseWeb3Error,
  setupWalletListeners,
  getConnectedAccounts,
} from "@/lib/ethereum";
import { INITIAL_WALLET_STATE, type WalletState } from "@/types/web3";
import WalletConnectButton from "@/components/WalletConnectButton";
import NetworkStatus from "@/components/NetworkStatus";
import AccountInfo from "@/components/AccountInfo";
import SendTransaction from "@/components/SendTransaction";
import { useToast } from "@/components/Toast";

/**
 * Dashboard Page Component
 *
 * Main entry point for the wallet connection dashboard.
 * Manages wallet state and coordinates between components.
 */
export default function Dashboard() {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_WALLET_STATE);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState<boolean | null>(null);
  const { addToast } = useToast();

  /**
   * Updates a single property in wallet state
   */
  const updateWalletState = useCallback((update: Partial<WalletState>) => {
    setWalletState((prev) => ({ ...prev, ...update }));
  }, []);

  /**
   * Fetches and updates the balance for a given address
   */
  const refreshBalance = useCallback(
    async (address: string) => {
      try {
        const balance = await getBalance(address);
        updateWalletState({ balance });
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    },
    [updateWalletState]
  );

  /**
   * Handles wallet connection
   */
  const handleConnect = useCallback(async () => {
    // Prevent multiple simultaneous connections
    if (walletState.isLoading) return;

    updateWalletState({ isLoading: true, error: null });

    try {
      // Check if MetaMask is installed
      if (!isMetaMaskInstalled()) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }

      // Connect to wallet
      const { address } = await connectWallet();

      // Get chain ID
      const chainId = await getChainId();

      // Get balance
      const balance = await getBalance(address);

      // Update state
      updateWalletState({
        isConnected: true,
        address,
        chainId,
        balance,
        isLoading: false,
      });

      addToast("Wallet connected successfully!", "success");
    } catch (error) {
      const errorMessage = parseWeb3Error(error);
      updateWalletState({ isLoading: false, error: errorMessage });
      addToast(errorMessage, "error");
    }
  }, [walletState.isLoading, updateWalletState, addToast]);

  /**
   * Handles wallet disconnection
   * Note: MetaMask doesn't have a true "disconnect" - we just clear local state
   */
  const handleDisconnect = useCallback(() => {
    setWalletState(INITIAL_WALLET_STATE);
    addToast("Wallet disconnected", "info");
  }, [addToast]);

  /**
   * Handles network switching to Sepolia
   */
  const handleSwitchNetwork = useCallback(async () => {
    try {
      await switchToSepolia();
      addToast("Switched to Sepolia network", "success");
    } catch (error) {
      const errorMessage = parseWeb3Error(error);
      addToast(errorMessage, "error");
    }
  }, [addToast]);

  /**
   * Handles account change events from MetaMask
   */
  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        setWalletState(INITIAL_WALLET_STATE);
        addToast("Wallet disconnected", "info");
      } else if (accounts[0] !== walletState.address) {
        // User switched to a different account
        const newAddress = accounts[0];
        updateWalletState({ address: newAddress });
        await refreshBalance(newAddress);
        addToast("Account changed", "info");
      }
    },
    [walletState.address, updateWalletState, refreshBalance, addToast]
  );

  /**
   * Handles chain/network change events from MetaMask
   */
  const handleChainChanged = useCallback(
    async (chainId: string) => {
      updateWalletState({ chainId });

      // Refresh balance on network change
      if (walletState.address) {
        await refreshBalance(walletState.address);
      }

      addToast("Network changed", "info");
    },
    [walletState.address, updateWalletState, refreshBalance, addToast]
  );

  /**
   * Check for existing connection on mount
   */
  useEffect(() => {
    const checkExistingConnection = async () => {
      // Check if MetaMask is installed
      const isInstalled = isMetaMaskInstalled();
      setIsMetaMaskAvailable(isInstalled);

      if (!isInstalled) return;

      try {
        // Check for existing connected accounts
        const accounts = await getConnectedAccounts();

        if (accounts.length > 0) {
          const address = accounts[0];
          const chainId = await getChainId();
          const balance = await getBalance(address);

          updateWalletState({
            isConnected: true,
            address,
            chainId,
            balance,
          });
        }
      } catch (error) {
        console.error("Error checking existing connection:", error);
      }
    };

    checkExistingConnection();
  }, [updateWalletState]);

  /**
   * Set up wallet event listeners
   */
  useEffect(() => {
    if (!isMetaMaskAvailable || !walletState.isConnected) return;

    const cleanup = setupWalletListeners({
      onAccountsChanged: handleAccountsChanged,
      onChainChanged: handleChainChanged,
      onDisconnect: handleDisconnect,
    });

    return cleanup;
  }, [
    isMetaMaskAvailable,
    walletState.isConnected,
    handleAccountsChanged,
    handleChainChanged,
    handleDisconnect,
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Logo */}
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Wallet Dashboard
            </h1>
          </div>
          <p className="text-gray-400 max-w-md mx-auto">
            Connect your MetaMask wallet to view your account details and manage
            your connection to the Sepolia testnet.
          </p>
        </header>

        {/* Dashboard Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-8 shadow-xl">
            {/* MetaMask Not Installed Warning */}
            {isMetaMaskAvailable === false && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-400 mb-1">
                      MetaMask Not Detected
                    </h3>
                    <p className="text-sm text-red-300/80">
                      MetaMask is required to use this application. Please{" "}
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-red-200 transition-colors"
                      >
                        install MetaMask
                      </a>{" "}
                      to continue.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Section */}
            <section className="mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {walletState.isConnected
                      ? "Wallet Connected"
                      : "Connect Your Wallet"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {walletState.isConnected
                      ? "Your wallet is connected and ready to use"
                      : "Click the button to connect with MetaMask"}
                  </p>
                </div>
                <WalletConnectButton
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  isConnected={walletState.isConnected}
                  isLoading={walletState.isLoading}
                  address={walletState.address}
                />
              </div>
            </section>

            {/* Connected State - Show Network and Account Info */}
            {walletState.isConnected && (
              <div className="space-y-6 animate-fade-in">
                {/* Divider */}
                <hr className="border-gray-700" />

                {/* Network Status Section */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Network Status
                  </h2>
                  <NetworkStatus
                    chainId={walletState.chainId}
                    onSwitchNetwork={handleSwitchNetwork}
                    isLoading={walletState.isLoading}
                  />
                </section>

                {/* Divider */}
                <hr className="border-gray-700" />

                {/* Account Information Section */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Account Information
                  </h2>
                  <AccountInfo
                    address={walletState.address}
                    balance={walletState.balance}
                    isLoading={walletState.isLoading}
                  />
                </section>

                {/* Divider */}
                <hr className="border-gray-700" />

                {/* Send Transaction Section */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Send ETH
                  </h2>
                  <SendTransaction
                    isConnected={walletState.isConnected}
                    onTransactionComplete={() => {
                      if (walletState.address) {
                        refreshBalance(walletState.address);
                      }
                    }}
                  />
                </section>
              </div>
            )}

            {/* Disconnected State - Show Getting Started */}
            {!walletState.isConnected && isMetaMaskAvailable !== false && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-4">
                  Getting Started
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-semibold">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Install MetaMask</p>
                      <p className="text-xs text-gray-400">
                        Browser extension required
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-semibold">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Connect Wallet</p>
                      <p className="text-xs text-gray-400">
                        Click the button above
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-semibold">3</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Switch to Sepolia</p>
                      <p className="text-xs text-gray-400">
                        Use the testnet for testing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>
              Built with Next.js 15, ethers.js, and Tailwind CSS
            </p>
            <p className="mt-1">
              Connected to Ethereum Sepolia Testnet
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
