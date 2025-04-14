"use client";

import { useSessionStore, Account } from "@/stores/session";
import { Hexpubkey, useNDKCurrentUser, useNDKSessions } from "@nostr-dev-kit/ndk-hooks";

/**
 * Hook to get the current account from the session store
 * If no account is selected, it defaults to the current user's pubkey
 *
 * @returns The current account or a default account with the user's pubkey
 */
export function useCurrentAccount(): Hexpubkey | null {
    const currentAccount = useSessionStore((state) => state.currentAccount);
    const currentUser = useNDKCurrentUser();

    return currentAccount?.pubkey || currentUser?.pubkey || null;
}
