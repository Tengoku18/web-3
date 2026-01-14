"use client";

/**
 * WalletConnectButton Component
 *
 * A button component for connecting and disconnecting MetaMask wallet.
 * Displays different states based on connection status.
 *
 * Features:
 * - Connect wallet button when disconnected
 * - Truncated address display when connected
 * - Copy address to clipboard
 * - Loading state during connection
 * - Disconnect functionality
 */

import React, { useState } from "react";
import { truncateAddress, copyToClipboard } from "@/lib/ethereum";
import type { WalletConnectButtonProps } from "@/types/web3";
import { useToast } from "./Toast";

/**
 * Wallet Connect Button Component
 *
 * @param props - Component props
 * @param props.onConnect - Callback function to initiate wallet connection
 * @param props.onDisconnect - Callback function to disconnect wallet
 * @param props.isConnected - Whether wallet is currently connected
 * @param props.isLoading - Whether a connection is in progress
 * @param props.address - Connected wallet address (null if disconnected)
 *
 * @example
 * <WalletConnectButton
 *   onConnect={handleConnect}
 *   onDisconnect={handleDisconnect}
 *   isConnected={walletState.isConnected}
 *   isLoading={walletState.isLoading}
 *   address={walletState.address}
 * />
 */
export default function WalletConnectButton({
  onConnect,
  onDisconnect,
  isConnected,
  isLoading,
  address,
}: WalletConnectButtonProps) {
  const { addToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  /**
   * Handles copying the wallet address to clipboard
   */
  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await copyToClipboard(address);
      setIsCopied(true);
      addToast("Address copied to clipboard!", "success");

      // Reset copy state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      addToast("Failed to copy address", "error");
    }
  };

  // Disconnected state - show connect button
  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        disabled={isLoading}
        className={`
          relative flex items-center justify-center gap-2
          px-6 py-3 rounded-xl font-semibold text-white
          transition-all duration-200 ease-in-out
          ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
          }
        `}
        aria-label={isLoading ? "Connecting wallet" : "Connect wallet"}
      >
        {isLoading ? (
          <>
            {/* Loading spinner */}
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            {/* MetaMask icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M36.0112 3L21.8862 13.2725L24.4362 7.12625L36.0112 3Z"
                fill="#E2761B"
                stroke="#E2761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.98877 3L17.9888 13.375L15.5638 7.12625L3.98877 3Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M31.0013 27.4775L27.1763 33.3525L35.2263 35.6025L37.5763 27.6025L31.0013 27.4775Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.43875 27.6025L4.77375 35.6025L12.8238 33.3525L8.99875 27.4775L2.43875 27.6025Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.3612 17.6275L10.0612 21.1275L18.0612 21.4775L17.7612 12.8525L12.3612 17.6275Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.6387 17.6275L22.1637 12.75L21.8887 21.4775L29.9387 21.1275L27.6387 17.6275Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.8238 33.3525L17.5488 31.0025L13.4988 27.6525L12.8238 33.3525Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22.4512 31.0025L27.1762 33.3525L26.5012 27.6525L22.4512 31.0025Z"
                fill="#E4761B"
                stroke="#E4761B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  // Connected state - show address and options
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Connected address display */}
      <div
        className="
          flex items-center gap-2 px-4 py-2
          bg-gray-800 rounded-xl border border-gray-700
        "
      >
        {/* Green status dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>

        {/* Truncated address */}
        <span className="text-gray-200 font-mono text-sm">
          {truncateAddress(address || "")}
        </span>

        {/* Copy button */}
        <button
          onClick={handleCopyAddress}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          aria-label="Copy address to clipboard"
          title="Copy address"
        >
          {isCopied ? (
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-gray-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Disconnect button */}
      <button
        onClick={onDisconnect}
        className="
          px-4 py-2 rounded-xl font-medium
          bg-red-600/20 text-red-400 border border-red-600/30
          hover:bg-red-600/30 hover:border-red-500/50
          transition-all duration-200
        "
        aria-label="Disconnect wallet"
      >
        Disconnect
      </button>
    </div>
  );
}
