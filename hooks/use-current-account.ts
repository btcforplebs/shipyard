"use client";

import { useSessionStore, Account } from "@/stores/session";
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks";

/**
 * Hook to get the current account from the session store
 * If no account is selected, it defaults to the current user's pubkey
 *
 * @returns The current account or a default account with the user's pubkey
 */
export function useCurrentAccount(): Account | null {
    const currentAccount = useSessionStore((state) => state.currentAccount);
    const sessions = useNDKSessions();

    // If there's a current account selected, return it
    if (currentAccount) {
        return currentAccount;
    }

    // If no account is selected but user is logged in, default to user's pubkey
    if (sessions.activePubkey) {
        return {
            pubkey: sessions.activePubkey,
        };
    }

    // If no account is selected and no user is logged in, return null
    return null;
}
