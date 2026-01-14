"use client";

import React, { useState, useCallback } from "react";
import {
  isValidAddress,
  validateAmount,
  sendTransaction,
  parseTransactionError,
  getSepoliaEtherscanTxUrl,
  truncateAddress,
} from "@/lib/ethereum";
import {
  INITIAL_TRANSACTION_STATE,
  type TransactionState,
  type TransactionFormData,
  type SendTransactionProps,
} from "@/types/web3";
import { useToast } from "./Toast";

/**
 * Send Transaction Component
 *
 * @param props - Component props
 * @param props.isConnected - Whether wallet is connected
 * @param props.onTransactionComplete - Optional callback after successful transaction
 *
 */
export default function SendTransaction({
  isConnected,
  onTransactionComplete,
}: SendTransactionProps) {
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<TransactionFormData>({
    recipient: "",
    amount: "",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    recipient: string | null;
    amount: string | null;
  }>({
    recipient: null,
    amount: null,
  });

  // Transaction state
  const [txState, setTxState] = useState<TransactionState>(INITIAL_TRANSACTION_STATE);

  /**
   * Validates the recipient address
   */
  const validateRecipient = useCallback((address: string): string | null => {
    if (!address.trim()) {
      return "Recipient address is required";
    }
    if (!isValidAddress(address)) {
      return "Invalid Ethereum address";
    }
    return null;
  }, []);

  /**
   * Handles input changes with validation
   */
  const handleInputChange = useCallback(
    (field: keyof TransactionFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear transaction state when form changes
      if (txState.status === "confirmed" || txState.status === "failed") {
        setTxState(INITIAL_TRANSACTION_STATE);
      }

      // Validate on change
      if (field === "recipient") {
        const error = value ? validateRecipient(value) : null;
        setFormErrors((prev) => ({ ...prev, recipient: error }));
      } else if (field === "amount") {
        const { error } = value ? validateAmount(value) : { error: null };
        setFormErrors((prev) => ({ ...prev, amount: error }));
      }
    },
    [txState.status, validateRecipient]
  );

  /**
   * Validates the entire form
   */
  const validateForm = useCallback((): boolean => {
    const recipientError = validateRecipient(formData.recipient);
    const { isValid: amountValid, error: amountError } = validateAmount(formData.amount);

    setFormErrors({
      recipient: recipientError,
      amount: amountError,
    });

    return !recipientError && amountValid;
  }, [formData, validateRecipient]);

  /**
   * Handles form submission and transaction sending
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Reset state and start sending
      setTxState({
        status: "sending",
        hash: null,
        error: null,
      });

      try {
        // Send transaction
        const { tx, wait } = await sendTransaction(formData.recipient, formData.amount);

        // Transaction submitted - now pending
        setTxState({
          status: "pending",
          hash: tx.hash,
          error: null,
        });

        addToast("Transaction submitted! Waiting for confirmation...", "info");

        // Wait for confirmation
        const receipt = await wait();

        if (receipt && receipt.status === 1) {
          // Transaction confirmed
          setTxState({
            status: "confirmed",
            hash: tx.hash,
            error: null,
          });

          addToast("Transaction confirmed successfully!", "success");

          // Clear form
          setFormData({ recipient: "", amount: "" });

          // Callback for balance refresh
          onTransactionComplete?.();
        } else {
          // Transaction failed on chain
          setTxState({
            status: "failed",
            hash: tx.hash,
            error: "Transaction failed on chain",
          });

          addToast("Transaction failed on chain", "error");
        }
      } catch (error) {
        const errorMessage = parseTransactionError(error);

        setTxState({
          status: "failed",
          hash: null,
          error: errorMessage,
        });

        addToast(errorMessage, "error");
      }
    },
    [formData, validateForm, addToast, onTransactionComplete]
  );

  /**
   * Resets the form and transaction state
   */
  const handleReset = useCallback(() => {
    setFormData({ recipient: "", amount: "" });
    setFormErrors({ recipient: null, amount: null });
    setTxState(INITIAL_TRANSACTION_STATE);
  }, []);

  // Determine if form can be submitted
  const isFormDisabled = !isConnected || txState.status === "sending" || txState.status === "pending";
  const isSubmitting = txState.status === "sending" || txState.status === "pending";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Address Input */}
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={formData.recipient}
            onChange={(e) => handleInputChange("recipient", e.target.value)}
            placeholder="0x..."
            disabled={isFormDisabled}
            className={`
              w-full px-4 py-3 bg-gray-900/50 border rounded-lg
              text-white placeholder-gray-500 font-mono text-sm
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${formErrors.recipient ? "border-red-500" : "border-gray-700 focus:border-blue-500"}
            `}
            aria-invalid={!!formErrors.recipient}
            aria-describedby={formErrors.recipient ? "recipient-error" : undefined}
          />
          {formErrors.recipient && (
            <p id="recipient-error" className="mt-1 text-sm text-red-400">
              {formErrors.recipient}
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Amount (ETH)
          </label>
          <div className="relative">
            <input
              type="text"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.0"
              disabled={isFormDisabled}
              className={`
                w-full px-4 py-3 pr-16 bg-gray-900/50 border rounded-lg
                text-white placeholder-gray-500 font-mono text-sm
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${formErrors.amount ? "border-red-500" : "border-gray-700 focus:border-blue-500"}
              `}
              aria-invalid={!!formErrors.amount}
              aria-describedby={formErrors.amount ? "amount-error" : undefined}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ETH
            </span>
          </div>
          {formErrors.amount && (
            <p id="amount-error" className="mt-1 text-sm text-red-400">
              {formErrors.amount}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className={`
            w-full flex items-center justify-center gap-2
            px-6 py-3 rounded-lg font-semibold
            transition-all duration-200
            ${
              isFormDisabled
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]"
            }
          `}
        >
          {isSubmitting ? (
            <>
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
              <span>
                {txState.status === "sending" ? "Confirm in Wallet..." : "Pending..."}
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>Send ETH</span>
            </>
          )}
        </button>
      </form>

      {/* Transaction Status Display */}
      {(txState.hash || txState.error) && (
        <div className="mt-4 animate-fade-in">
          {/* Success State */}
          {txState.status === "confirmed" && txState.hash && (
            <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <svg
                  className="w-5 h-5"
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
                <span className="font-semibold">Transaction Confirmed</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Transaction Hash:</span>
                  <span className="text-gray-200 font-mono">
                    {truncateAddress(txState.hash, 10, 8)}
                  </span>
                </div>
                <a
                  href={getSepoliaEtherscanTxUrl(txState.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <span>View on Etherscan</span>
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <button
                onClick={handleReset}
                className="mt-3 w-full px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
              >
                Send Another Transaction
              </button>
            </div>
          )}

          {/* Pending State */}
          {txState.status === "pending" && txState.hash && (
            <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <svg
                  className="w-5 h-5 animate-spin"
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
                <span className="font-semibold">Transaction Pending</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Waiting for blockchain confirmation...
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Transaction Hash:</span>
                <span className="text-gray-200 font-mono">
                  {truncateAddress(txState.hash, 10, 8)}
                </span>
              </div>
              <a
                href={getSepoliaEtherscanTxUrl(txState.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
              >
                <span>Track on Etherscan</span>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* Error State */}
          {txState.status === "failed" && txState.error && (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="font-semibold">Transaction Failed</span>
              </div>
              <p className="text-sm text-red-300">{txState.error}</p>
              {txState.hash && (
                <a
                  href={getSepoliaEtherscanTxUrl(txState.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
                >
                  <span>View on Etherscan</span>
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
              <button
                onClick={handleReset}
                className="mt-3 w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Not Connected Warning */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-400 flex items-center gap-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Connect your wallet to send transactions</span>
          </p>
        </div>
      )}
    </div>
  );
}
