import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { refreshAuthToken } from "@/lib/api";
import { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

// Mock the fetch function
global.fetch = mock.fn();

// Mock localStorage
const localStorageMock = {
  getItem: mock.fn(),
  setItem: mock.fn(),
  removeItem: mock.fn(),
};
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock window.nostr (NIP-07 extension)
const nostrMock = {
  getPublicKey: mock.fn(),
  signEvent: mock.fn(),
};
Object.defineProperty(global, "window", {
  value: {
    nostr: nostrMock,
    location: { href: "" },
    dispatchEvent: mock.fn(),
  },
  writable: true,
});

// Mock document.cookie
Object.defineProperty(global, "document", {
  value: {
    cookie: "",
  },
  writable: true,
});

// Mock NDKEvent and NDKNip07Signer
mock("@nostr-dev-kit/ndk", () => {
  return {
    NDKEvent: mock.fn().mockImplementation(() => {
      return {
        kind: 0,
        content: "",
        tags: [],
        created_at: 0,
        sign: mock.fn().mockResolvedValue(true),
        rawEvent: mock.fn().mockReturnValue({
          kind: 27235,
          content: "",
          tags: [
            ["u", "/api/auth/login"],
            ["method", "POST"],
          ],
          created_at: Math.floor(Date.now() / 1000),
          pubkey: "test-pubkey",
          id: "test-id",
          sig: "test-sig",
        }),
      };
    }),
    NDKNip07Signer: mock.fn().mockImplementation(() => {
      return {
        user: mock.fn().mockResolvedValue({ pubkey: "test-pubkey" }),
      };
    }),
  };
});

describe("API Token Refresh", () => {
  beforeEach(() => {
    // Reset mocks
    mock.resetAll();
    
    // Setup default mock responses
    (fetch as unknown).mockResolvedValue({
      ok: true,
      json: mock.fn().mockResolvedValue({ token: "new-token" }),
    });
  });

  afterEach(() => {
    // Clear mocks
    mock.resetAll();
  });

  test("refreshAuthToken should create a new token and store it", async () => {
    // Call the function
    const result = await refreshAuthToken();

    // Verify fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: expect.any(String),
    });

    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith("auth_token", "new-token");

    // Verify the result is the new token
    expect(result).toBe("new-token");
  });

  test("refreshAuthToken should handle errors and redirect to login", async () => {
    // Mock fetch to return an error
    (fetch as unknown).mockResolvedValue({
      ok: false,
      status: 401,
      json: mock.fn().mockResolvedValue({ message: "Invalid signature" }),
    });

    // Mock window.alert
    global.alert = mock.fn();

    // Call the function
    const result = await refreshAuthToken();

    // Verify alert was called
    expect(alert).toHaveBeenCalledWith("Your session has expired. Please sign in again.");

    // Verify redirect to login page
    expect(window.location.href).toBe("/login");

    // Verify the result is null
    expect(result).toBe(null);
  });

  test("refreshAuthToken should handle missing nostr extension", async () => {
    // Remove nostr from window
    delete (window as unknown).nostr;

    // Mock window.alert
    global.alert = mock.fn();

    // Call the function
    const result = await refreshAuthToken();

    // Verify alert was called
    expect(alert).toHaveBeenCalledWith("Your session has expired. Please sign in again.");

    // Verify redirect to login page
    expect(window.location.href).toBe("/login");

    // Verify the result is null
    expect(result).toBe(null);
  });
});