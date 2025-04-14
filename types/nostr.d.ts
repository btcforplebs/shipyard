/**
 * Type definitions for NIP-07 window.nostr object
 * https://github.com/nostr-protocol/nips/blob/master/07.md
 */

interface Window {
  nostr?: {
    /**
     * Get the user's public key
     */
    getPublicKey(): Promise<string>;

    /**
     * Sign an event with the user's private key
     */
    signEvent(event: {
      kind: number;
      created_at: number;
      tags: string[][];
      content: string;
    }): Promise<{
      id: string;
      pubkey: string;
      created_at: number;
      kind: number;
      tags: string[][];
      content: string;
      sig: string;
    }>;

    /**
     * Encrypt a message with NIP-04
     */
    nip04?: {
      encrypt(pubkey: string, plaintext: string): Promise<string>;
      decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };

    /**
     * Get relays from the extension
     */
    getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
  };
}