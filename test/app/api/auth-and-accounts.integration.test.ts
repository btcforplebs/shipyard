import { describe, test, expect, mock } from "bun:test";
import { POST as loginPOST } from "../../../app/api/auth/login/route";
import { GET as accountsGET } from "../../../app/api/accounts/route";
import { NextRequest } from "next/server";

// Mock validateNIP98Event to always succeed for our test pubkey
mock.module("../../../lib/nostr/validateNIP98Event", () => {
  return {
    validateNIP98Event: async (event: any, _options: any) => {
      if (event.pubkey === TEST_PUBKEY) {
        return { valid: true, pubkey: event.pubkey };
      }
      return { valid: false, error: "Invalid event" };
    },
  };
});

// Helper: minimal valid pubkey for testing
const TEST_PUBKEY = "test-pubkey-123";

// Helper: minimal valid NIP-98 event for login
function createValidNIP98Event(pubkey: string) {
  return {
    id: "dummyid",
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    kind: 27235,
    tags: [
      ["u", "/api/auth/login"],
      ["method", "POST"],
      ["payload", ""],
      ["created_at", Math.floor(Date.now() / 1000).toString()],
    ],
    content: "",
    sig: "dummysig",
  };
}

type Account = {
  pubkey: string;
  createdAt?: string;
  updatedAt?: string;
};

describe("Integration: login and /api/accounts", () => {
  let jwt: string;

  test("should login and receive a JWT", async () => {
    const event = createValidNIP98Event(TEST_PUBKEY);

    // Simulate login request
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });

    const res = await loginPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("token");
    expect(body).toHaveProperty("pubkey", TEST_PUBKEY);

    jwt = body.token;
    expect(typeof jwt).toBe("string");
  });

  test("should call /api/accounts with JWT and get accounts", async () => {
    // In direct handler invocation, middleware is not run.
    // So we must manually verify the JWT and inject x-auth-pubkey header.
    // This simulates what the middleware would do in production.

    // Import verifyJWT here to avoid circular import issues
    const { verifyJWT } = await import("../../../lib/auth/jwt");
    const verification = await verifyJWT(jwt);
    expect(verification.valid).toBe(true);
    expect(verification.pubkey).toBe(TEST_PUBKEY);

    // Inject x-auth-pubkey header as middleware would
    const req = new NextRequest("http://localhost/api/accounts", {
      method: "GET",
      headers: { "x-auth-pubkey": verification.pubkey! },
    });

    const res = await accountsGET(req);
    expect(res.status).toBe(200);

    const accounts: Account[] = await res.json();
    expect(Array.isArray(accounts)).toBe(true);
    // Should include the test pubkey account
    expect(accounts.some((a) => a.pubkey === TEST_PUBKEY)).toBe(true);
  });
});