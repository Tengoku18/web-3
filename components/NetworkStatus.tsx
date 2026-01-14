"use client";

/**
 * NetworkStatus Component
 *
 * Displays the current blockchain network status and provides
 * functionality to switch to the Sepolia testnet.
 *
 * Features:
 * - Current network display with status badge
 * - Warning banner when not on Sepolia
 * - Network switch button
 * - Loading state during network switch
 */

import React, { useState } from "react";
import { getNetworkName, isSepoliaNetwork } from "@/lib/ethereum";
import type { NetworkStatusProps } from "@/types/web3";

/**
 * Network Status Component
 *
 * @param props - Component props
 * @param props.chainId - Current chain ID in hexadecimal format
 * @param props.onSwitchNetwork - Callback function to switch to Sepolia
 * @param props.isLoading - Whether a network switch is in progress
 *
 * @example
 * <NetworkStatus
 *   chainId={walletState.chainId}
 *   onSwitchNetwork={handleSwitchNetwork}
 *   isLoading={isNetworkSwitching}
 * />
 */
export default function NetworkStatus({
  chainId,
  onSwitchNetwork,
  isLoading,
}: NetworkStatusProps) {
  const [isSwitching, setIsSwitching] = useState(false);
  const networkName = getNetworkName(chainId);
  const isCorrectNetwork = isSepoliaNetwork(chainId);

  /**
   * Handles the network switch action
   */
  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      await onSwitchNetwork();
    } finally {
      setIsSwitching(false);
    }
  };

  const loading = isLoading || isSwitching;

  return (
    <div className="w-full">
      {/* Network Info Card */}
      <div
        className={`
          p-4 rounded-xl border transition-all duration-200
          ${
            isCorrectNetwork
              ? "bg-green-900/20 border-green-700/50"
              : "bg-yellow-900/20 border-yellow-700/50"
          }
        `}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Network Information */}
          <div className="flex items-center gap-3">
            {/* Network Icon */}
            <div
              className={`
                p-2 rounded-lg
                ${isCorrectNetwork ? "bg-green-600/30" : "bg-yellow-600/30"}
              `}
            >
              <svg
                className={`w-5 h-5 ${
                  isCorrectNetwork ? "text-green-400" : "text-yellow-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm text-gray-400">Current Network</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">{networkName}</p>
                {/* Status Badge */}
                <span
                  className={`
                    px-2 py-0.5 text-xs font-medium rounded-full
                    ${
                      isCorrectNetwork
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }
                  `}
                >
                  {isCorrectNetwork ? "Correct" : "Wrong Network"}
                </span>
              </div>
            </div>
          </div>

          {/* Switch Network Button (only show if wrong network) */}
          {!isCorrectNetwork && (
            <button
              onClick={handleSwitch}
              disabled={loading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200
                ${
                  loading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]"
                }
              `}
              aria-label="Switch to Sepolia network"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  <span>Switching...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <span>Switch to Sepolia</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Warning Message (only show if wrong network) */}
        {!isCorrectNetwork && (
          <div className="mt-4 pt-4 border-t border-yellow-700/30">
            <div className="flex items-start gap-2 text-yellow-400">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
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
              <p className="text-sm">
                You are connected to <strong>{networkName}</strong>. This
                application requires the <strong>Sepolia Testnet</strong>. Please
                switch networks to continue.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Correct Network Success Message */}
      {isCorrectNetwork && (
        <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
          <svg
            className="w-4 h-4"
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
          <span>You&apos;re connected to the correct network</span>
        </div>
      )}
    </div>
  );
}
