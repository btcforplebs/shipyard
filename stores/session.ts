import { create } from 'zustand';
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
  
  // Actions
  setCurrentAccount: (account: Account | null) => void;
}

/**
 * Session store using Zustand
 * Manages the current account and provides methods to interact with it
 */
export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  currentAccount: null,
  
  // Actions
  setCurrentAccount: (account) => set({ currentAccount: account }),
}));