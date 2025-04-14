# NIP-98 Authentication System Tests

This directory contains test files for the NIP-98 authentication system. The tests are written using Bun's test runner and follow the Test-Driven Development (TDD) approach.

## Test Structure

The tests are organized to mirror the project structure:

```
test/
├── lib/
│   ├── nostr/
│   │   ├── ndk.test.ts           # Tests for NDK singleton
│   │   ├── schemas.test.ts       # Tests for Zod schema for NostrEvent
│   │   └── validateNIP98Event.test.ts # Tests for event validation utility
│   ├── auth/
│   │   ├── jwt.test.ts           # Tests for JWT issue/verify
│   │   └── middleware.test.ts    # Tests for JWT validation, pubkey attach
│   ├── services/
│   │   └── user.test.ts          # Tests for user service
│   └── logger.test.ts            # Tests for logging
└── app/
    └── api/
        └── auth/
            └── login/
                └── route.test.ts  # Tests for login POST endpoint
```

## Running Tests

To run all tests:

```bash
bun test
```

To run a specific test file:

```bash
bun test test/lib/nostr/ndk.test.ts
```

## Test Coverage

The tests cover the following scenarios:

### NDK Singleton (ndk.test.ts)
- Exporting an NDK instance
- Configuration with explicit relays
- Serializing and deserializing signers

### Nostr Event Schemas (schemas.test.ts)
- Validating valid Nostr events
- Rejecting events with missing required fields
- Validating NIP-98 auth events
- Rejecting auth events with wrong kind or missing tags

### NIP-98 Event Validation (validateNIP98Event.test.ts)
- Validating valid NIP-98 events
- Rejecting events with invalid signatures
- Rejecting expired events
- Rejecting events from the future
- Rejecting events with mismatched URL or method
- Handling replay protection

### JWT Authentication (jwt.test.ts)
- Issuing valid JWT tokens
- Verifying valid tokens
- Rejecting invalid or tampered tokens
- Handling token expiration
- Including custom claims

### Auth Middleware (middleware.test.ts)
- Passing requests with valid JWT tokens
- Rejecting requests with missing or invalid authorization
- Handling optional authentication

### Login API Route (route.test.ts)
- Authenticating with valid NIP-98 events
- Rejecting requests with missing or invalid authorization
- Rejecting requests with invalid NIP-98 events
- Handling errors during user creation

### User Service (user.test.ts)
- Getting a user by pubkey
- Creating a new user
- Getting or creating a user
- Getting all accounts a user has access to
- Handling database errors

### Logger (logger.test.ts)
- Logging at different levels
- Including timestamps
- Formatting objects and errors
- Supporting context objects
- Respecting log level configuration
- Supporting custom formatters

## Security Cases

The tests specifically cover these security cases:

1. **Signature Validation**: Ensuring only properly signed events are accepted
2. **Replay Protection**: Preventing the reuse of authentication events
3. **Expiration Checks**: Rejecting events that are too old or from the future
4. **JWT Tampering**: Detecting and rejecting tampered JWT tokens
5. **JWT Expiration**: Enforcing token expiration
6. **Authorization Format**: Ensuring proper authorization header format
7. **Error Handling**: Proper error responses without leaking sensitive information

## Implementation Notes

These tests are written following the TDD approach, which means they are written before the actual implementation. The implementation should be developed to make these tests pass.

The tests use mocking to isolate the components being tested and to avoid dependencies on external services.