"use client";

import { useSessionStore } from "@/stores/session";

/**
 * AccountDisplay component
 * 
 * Displays the current account's public key if it exists,
 * or a message if no account is selected.
 */
export function AccountDisplay() {
  // Get the current account from the session store
  const currentAccount = useSessionStore((state) => state.currentAccount);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Current Account</h2>
      {currentAccount ? (
        <div>
          <p className="text-sm text-gray-500">Public Key:</p>
          <p className="font-mono text-xs break-all">
            {currentAccount.pubkey}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No account selected</p>
      )}
    </div>
  );
}