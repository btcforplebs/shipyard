import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Hexpubkey } from '@nostr-dev-kit/ndk';

/**
 * Account type definition
 * Currently only contains pubkey, but can be extended in the future
 */
export interface Account {
  pubkey: Hexpubkey;
}

/**
 * Session state interface
 * Contains the current account and methods to interact with it
 */
interface SessionState {
  // State
  currentAccount: Account | null;
  isProCardDismissed: boolean;
  
  // Actions
  setCurrentAccount: (account: Account | null) => void;
  setProCardDismissed: (dismissed: boolean) => void;
}

/**
 * Session store using Zustand
 * Manages the current account and provides methods to interact with it
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // Initial state
      currentAccount: null,
      isProCardDismissed: false,
      
      // Actions
      setCurrentAccount: (account) => set({ currentAccount: account }),
      setProCardDismissed: (dismissed) => set({ isProCardDismissed: dismissed }),
    }),
    {
      name: 'session-storage',
    }
  )
);