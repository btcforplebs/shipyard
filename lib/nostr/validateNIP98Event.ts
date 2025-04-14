import { NDKEvent } from "@nostr-dev-kit/ndk";
import ndk from "./ndk";

// Options for validation
interface ValidationOptions {
    url: string;
    method: string;
    maxAgeSecs?: number;
    checkReplay?: boolean;
}

// Result of validation
interface ValidationResult {
    valid: boolean;
    pubkey?: string;
    error?: string;
}

// Store for replay protection
const usedEventIds = new Set<string>();

/**
 * Validates a NIP-98 HTTP Auth event
 *
 * @param event The NIP-98 event to validate
 * @param options Validation options
 * @returns Validation result with pubkey if valid
 */
export async function validateNIP98Event(event: NDKEvent, options: ValidationOptions): Promise<ValidationResult> {
    // Default maxAgeSecs to 60 seconds if not provided
    const maxAgeSecs = options.maxAgeSecs ?? 60;

    // Check if event is of the correct kind (27235 for NIP-98)
    if (event.kind !== 27235) {
        return { valid: false, error: "Invalid event kind, expected 27235 for NIP-98" };
    }

    // Verify signature
    const isSignatureValid = await event.verifySignature(true);
    if (!isSignatureValid) {
        return { valid: false, error: "Invalid signature" };
    }

    // Check if event is too old
    const now = Math.floor(Date.now() / 1000);
    if (event.created_at < now - maxAgeSecs) {
        return { valid: false, error: "Event expired" };
    }

    // Check if event is from the future (with a small tolerance)
    if (event.created_at > now + 30) {
        return { valid: false, error: "Event timestamp is in the future" };
    }

    // Check for required tags
    const uTag = event.tags.find((tag) => tag[0] === "u");
    const methodTag = event.tags.find((tag) => tag[0] === "method");

    if (!uTag || !methodTag) {
        return { valid: false, error: "Missing required tag (u or method)" };
    }

    // Check if URL matches
    if (uTag[1] !== options.url) {
        return { valid: false, error: "URL mismatch" };
    }

    // Check if method matches
    if (methodTag[1] !== options.method) {
        return { valid: false, error: "HTTP method mismatch" };
    }

    // Check for replay if enabled
    if (options.checkReplay) {
        if (usedEventIds.has(event.id)) {
            return { valid: false, error: "Event replay detected" };
        }

        // Add to used events set
        usedEventIds.add(event.id);
    }

    // All checks passed
    return { valid: true, pubkey: event.pubkey };
}
