# Shipyard Architecture

This document outlines the architectural decisions and patterns used in the Shipyard project.

## State Management

### Session Store

The session store is implemented using Zustand, a lightweight state management library. It provides a centralized way to manage the current account and other session-related state.

#### Location

The session store is located in `context/session-store.ts`.

#### Structure

The session store follows a simple structure:

```typescript
interface SessionState {
  // State
  currentAccount: Account | null;
  
  // Actions
  setCurrentAccount: (account: Account | null) => void;
}
```

#### Usage

Components can import and use the session store as follows:

```typescript
import { useSessionStore } from '../context/session-store';

// In a component
const currentAccount = useSessionStore(state => state.currentAccount);
const setCurrentAccount = useSessionStore(state => state.setCurrentAccount);
```

Using selectors like this helps minimize re-renders and improves performance.

#### Hooks

The project provides a `useCurrentAccount` hook that simplifies access to the current account:

```typescript
import { useCurrentAccount } from '../hooks/use-current-account';

// In a component
const currentAccount = useCurrentAccount();
```

This hook automatically handles the case where no account is explicitly selected by defaulting to the current user's pubkey. This ensures that components always have a valid account context when the user is logged in.

#### Extensibility

The session store is designed to be extensible. To add new session-related state or actions, simply update the `SessionState` interface and add the corresponding state and actions to the store.

## Nostr Integration

The project uses the Nostr Development Kit (NDK) for interacting with the Nostr protocol. The NDK provider is implemented in `components/providers/ndk.tsx` and provides access to NDK functionality throughout the application.

### Account Type

The `Account` type is defined as:

```typescript
export interface Account {
  pubkey: Hexpubkey;
}
```

Where `Hexpubkey` is imported from `@nostr-dev-kit/ndk`.

This type is used to represent a Nostr account in the application. It currently only contains the public key, but can be extended in the future to include additional account information.

## ContentCard Thread Rendering

As of 2025-04-15, the `ContentCard` component in `components/content-card.tsx` supports rendering Nostr threads:

- If a post's `rawEvents` array contains more than one event, the card renders all events as a tweet thread (vertical stack), visually resembling a Twitter/X thread.
- Each event in the thread is rendered as a sub-card (with avatar, display name, handle, and content).
- The main card actions (edit, repost, etc.) are only shown on the first tweet in the thread to avoid UI clutter.
- If there is only one event, the card renders as a single tweet (as before).
- The thread rendering logic is modular, using `Tweet` and `TweetThread` subcomponents within `ContentCard`.
- This supports the multi-event post model described in the database architecture section, and ensures the UI accurately reflects the structure of multi-part Nostr posts.

## Dashboard Page: Client Component and Account Flow

As of 2025-04-14, the dashboard page (`app/dashboard/page.tsx`) is implemented as a **client component** (with `"use client"` at the top). This is required because it uses the `useCurrentAccount` hook, which is client-only and depends on Zustand state and NDK hooks.

**Account Pubkey Flow:**
- The dashboard page calls `useCurrentAccount()` to get the current account's pubkey (or null if not available).
- The `DashboardContentQueue` component expects a `string` pubkey prop. To ensure type safety, the dashboard page only renders `DashboardContentQueue` if the pubkey is available, otherwise it shows a loading message.
- This prevents server/client boundary errors and TypeScript type errors.

**Relevant code pattern:**
```tsx
const accountPubkey = useCurrentAccount();

{accountPubkey ? (
  <DashboardContentQueue accountPubkey={accountPubkey} />
) : (
  <div className="text-center py-8 text-muted-foreground">Loading account...</div>
)}
```

This pattern should be followed for any client component that depends on Zustand/NDK state.

## Database Architecture

The project uses SQLite as the database with Prisma ORM for database access and migrations. This provides a robust persistence layer for storing user data, content drafts, schedules, and other application data.

### ORM: Prisma

Prisma is used as the ORM (Object-Relational Mapping) tool for the project. It provides:
- Type-safe database access with auto-generated TypeScript types
- Schema migrations
- Query building
- Relationship handling

#### Location

- Prisma schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Database client: `lib/db.ts`

#### Database Models

The database schema includes the following main models:

1. **User**: Represents Nostr identities that can access the system
2. **Account**: Represents Nostr identities that own content
3. **Setting**: Account-level settings like default relays
4. **AccountUser**: Join table for accounts and users (collaborators)
5. **Post**: Represents Nostr events (notes, articles, etc.)
   
#### Post Model: Multi-Event Support

- The `Post` model now supports storing and publishing multiple Nostr events per post.
- The `rawEvents` field (type: String, mapped as `raw_events`) contains a JSON-serialized array of raw Nostr event objects.
- All post creation, update, and retrieval logic has been updated to handle arrays of events, enabling batch publishing and multi-part content.

6. **Queue**: Organizes content within an account
7. **Schedule**: Associates posts with queues and defines when they should be published
8. **Subscription**: Tracks the subscription status of accounts
9. **Payment**: Tracks payment transactions
10. **AuditLog**: Tracks actions in the system

#### Usage

To interact with the database, import the Prisma client from `lib/db.ts`:

```typescript
import { prisma } from '../lib/db';

// Example: Create a new user
async function createUser(pubkey: string) {
  return await prisma.user.create({
    data: {
      pubkey,
    },
  });
}

// Example: Find an account with its settings
async function getAccountWithSettings(pubkey: string) {
  return await prisma.account.findUnique({
    where: { pubkey },
    include: { settings: true },
  });
}
```

#### Migrations

Database migrations are managed through Prisma. To create a new migration after schema changes:

```bash
bunx prisma migrate dev --name <migration-name>
```

To apply migrations in production:

```bash
bunx prisma migrate deploy
```

### Data Flow

1. **Client-side state** (Zustand stores, React state) is used for UI and temporary data
2. **Persistent data** is stored in the SQLite database via Prisma
3. **Nostr events** are stored both in the database (for scheduling and management) and published to the Nostr network via NDK

This architecture allows for robust offline capabilities and reliable scheduling while maintaining the decentralized nature of Nostr for the actual content publication.


## API Endpoints

The application exposes several API endpoints for client-server communication.

### Authentication

- **POST /api/auth/login**: Authenticates a user using a NIP-98 event and returns a JWT.

### Accounts

- **GET /api/accounts**: Returns a list of accounts the authenticated user has access to.
- **GET /api/accounts/[account_pubkey]/queues**: Returns a list of queues for the specified account.

### Queues

- **GET /api/queues**: (Placeholder - To be implemented)
- **POST /api/queues**: (Placeholder - To be implemented)

### Posts

- **POST /api/posts**: Create a new post (accepts `account_pubkey` and an array of `rawEvents[]` representing tweets or threads).
- **POST /api/posts/[post-id]/schedule**: Schedule or update the publishing of a post (e.g., set `isDraft: false` and store schedule info).
- **GET /api/posts?account_pubkey=...**: Returns all posts for the specified account.

#### Post Creation & Scheduling Flow

1. **Frontend (Composer Short)**
   - User composes a tweet or thread using the ThreadComposer component.
   - On scheduling, the frontend sends a POST to `/api/posts` with the account pubkey and the array of raw events.
   - After creation, the frontend calls POST `/api/posts/<post-id>/schedule` to schedule the post.
   - On success, the user is redirected to the dashboard.

2. **Backend**
   - The `/api/posts` endpoint creates a new post in the database, storing the array of raw Nostr events.
   - The `/api/posts/[post-id]/schedule` endpoint updates the post (e.g., sets `isDraft: false`).
   - The `/api/posts` GET endpoint returns all scheduled posts for the account.

3. **Dashboard Integration**
   - The dashboard fetches posts for the current account using GET `/api/posts?account_pubkey=...`.
   - Posts are displayed in the Content Queue via the QueueList component, which now accepts real post data as a prop.

4. **Testing**
   - Comprehensive tests exist for all new API endpoints, covering creation, scheduling, and fetching of posts.

## Authentication Flow

The application uses JWT (JSON Web Tokens) for authentication. This section describes the complete authentication flow from login to API access.

### Login Process

1. The user initiates authentication by sending a NIP-98 AUTH event to the `/api/auth/login` endpoint.
2. The server validates the NIP-98 event, which includes verifying the signature and ensuring the event is recent.
3. Upon successful validation, the server issues a JWT token containing the user's pubkey in the `sub` claim.
4. The JWT token is returned to the client, which stores it for subsequent requests.

### Middleware Authentication

Authentication for protected routes is handled by the middleware defined in `middleware.ts`. The middleware performs the following steps:

1. Checks if the requested path is public (e.g., `/login`, `/api/auth/login`). If so, allows the request to proceed without authentication.
2. For API routes (`/api/*`):
   - Extracts the JWT token from the `Authorization` header (Bearer token format)
   - Verifies the token using the `verifyJWT` function from `lib/auth/jwt.ts`
   - If verification fails, returns a 401 Unauthorized response
   - If verification succeeds, injects the pubkey from the token into a custom request header `x-auth-pubkey`
   - Allows the request to proceed with the modified headers
3. For dashboard routes (`/dashboard/*`):
   - Extracts the JWT token from the `auth_token` cookie
   - Verifies the token using the `verifyJWT` function
   - If verification fails, redirects to the login page and clears the invalid cookie
   - If verification succeeds, injects the pubkey into the `x-auth-pubkey` header
   - Allows the request to proceed with the modified headers

### JWT Verification

The `verifyJWT` function in `lib/auth/jwt.ts` handles token verification:

```typescript
export async function verifyJWT(token: string): Promise<JWTVerificationResult> {
  try {
    // Verify the token using the JWT_SECRET
    const { payload } = await jwtVerify(token, secretKey);
    
    // Check if the token has a subject (pubkey)
    if (!payload.sub) {
      return {
        valid: false,
        error: 'Token missing subject (pubkey)'
      };
    }
    
    // Return success with the pubkey
    return {
      valid: true,
      pubkey: payload.sub,
      claims: { ...payload }
    };
  } catch (error) {
    // Return failure with appropriate error message
    return {
      valid: false,
      error: 'Invalid token'
    };
  }
}
```

### Accessing the Authenticated User in API Routes

To access the authenticated user's pubkey in API route handlers, use the `getPubkeyFromRequest` utility function from `lib/auth/request.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getPubkeyFromRequest } from '@/lib/auth/request';

export async function GET(request: Request) {
  try {
    // Get the authenticated user's pubkey
    const pubkey = getPubkeyFromRequest(request);
    
    // Use the pubkey to perform authorized operations
    // For example, fetch user-specific data from the database
    const userData = await prisma.user.findUnique({
      where: { pubkey }
    });
    
    return NextResponse.json({ user: userData });
  } catch (error) {
    // Handle authentication errors
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }
}
```

### Best Practices for API Authentication

1. **Always use the `getPubkeyFromRequest` function** to extract the authenticated user's pubkey in API routes. This ensures consistent handling of authentication across the application.

2. **Never manually extract or verify JWT tokens in API routes**. The middleware handles token verification, and API routes should rely on the `x-auth-pubkey` header.

3. **Handle authentication errors properly**. The `getPubkeyFromRequest` function throws an error if the pubkey is not found, which should be caught and handled with an appropriate 401 Unauthorized response.

4. **Verify authorization for resource access**. After obtaining the authenticated pubkey, verify that the user has permission to access the requested resource (e.g., check if they own the account or are a collaborator).

5. **Keep sensitive operations server-side**. Use the authenticated pubkey to perform operations on the server rather than sending sensitive data to the client.

6. **Use the shared API utility for authenticated client requests.**
   All client components that make authenticated API calls should use the shared utility functions in `lib/api.ts` (such as `apiPost`, `apiPut`, `apiDelete`). These utilities automatically include the JWT from localStorage in the `Authorization` header, ensuring consistent authentication and reducing duplication.
   For example, the compose page (`app/compose/short/page.tsx`) uses `apiPost` for all backend calls that require authentication.

### Security Considerations

1. The JWT secret (`JWT_SECRET` environment variable) must be kept secure and should be different across environments.

2. JWT tokens have an expiration time to limit the window of opportunity for token misuse.

3. The middleware ensures that authentication is enforced consistently across all protected routes.

4. The `x-auth-pubkey` header is internal to the application and should not be exposed to clients or relied upon for external requests.
