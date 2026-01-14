"use client";


import React from "react";
import type { AccountInfoProps } from "@/types/web3";

/**
 * Account Info Component
 *
 * @param props - Component props
 * @param props.address - Connected wallet address
 * @param props.balance - ETH balance as formatted string
 * @param props.isLoading - Whether data is being fetched
 *
 * @example
 * <AccountInfo
 *   address={walletState.address}
 *   balance={walletState.balance}
 *   isLoading={walletState.isLoading}
 * />
 */
export default function AccountInfo({
  address,
  balance,
  isLoading,
}: AccountInfoProps) {
  /**
   * Generates Etherscan URL for the address
   * Using Sepolia testnet explorer
   */
  const getEtherscanUrl = (addr: string) =>
    `https://sepolia.etherscan.io/address/${addr}`;

  return (
    <div className="w-full space-y-4">
      {/* Balance Card */}
      <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">ETH Balance</p>
            {isLoading ? (
              // Loading skeleton
              <div className="h-9 w-32 bg-gray-700 rounded animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {balance || "0.0000"}
                </span>
                <span className="text-lg text-gray-400">ETH</span>
              </div>
            )}
          </div>

          {/* ETH Icon */}
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <svg
              className="w-8 h-8 text-blue-400"
              viewBox="0 0 256 417"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"
                opacity="0.6"
              />
              <path
                fillRule="evenodd"
                d="M127.962 0L0 212.32l127.962 75.639V154.158z"
              />
              <path
                fillRule="evenodd"
                d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"
                opacity="0.6"
              />
              <path fillRule="evenodd" d="M127.962 416.905v-104.72L0 236.585z" />
              <path
                fillRule="evenodd"
                d="M127.961 287.958l127.96-75.637-127.96-58.162z"
                opacity="0.45"
              />
              <path
                fillRule="evenodd"
                d="M0 212.32l127.96 75.638v-133.8z"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Wallet Address</p>
          {address && (
            <a
              href={getEtherscanUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center gap-1 text-xs text-blue-400
                hover:text-blue-300 transition-colors
              "
              aria-label="View on Etherscan"
            >
              <span>View on Etherscan</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="h-6 w-full bg-gray-700 rounded animate-pulse" />
        ) : (
          <p
            className="
              font-mono text-sm text-gray-200
              bg-gray-900/50 p-2 rounded-lg
              break-all select-all
            "
          >
            {address || "Not connected"}
          </p>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Network Info */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="text-sm text-gray-400">Network</p>
          </div>
          <p className="text-white font-medium">Sepolia</p>
        </div>

        {/* Status Info */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-sm text-gray-400">Status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <p className="text-green-400 font-medium">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
