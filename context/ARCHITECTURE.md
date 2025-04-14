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

### Middleware

Authentication for protected API routes is handled by the middleware defined in `middleware.ts`. It verifies the JWT token present in the `Authorization` header.
