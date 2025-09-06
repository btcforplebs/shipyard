# Shipyard

A content management and scheduling tool for the Nostr protocol.

## Database Setup

Shipyard uses SQLite with Prisma ORM for database management. Follow these steps to set up and work with the database:

### Initial Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Generate Prisma client:
   ```bash
   bun run db:generate
   ```
3. Create new .env file:
   ```bash
   nano .env
   ```
   paste the following:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="super-secret-long-random-string"
   ```
   you can generate super-secret-long-random-string with
   ```
   openssl rand -base64 32
   ```

5. Run migrations to create the database:
   ```bash
   bun run db:migrate
   ```

6. Seed the database with initial data:
   ```bash
   bun run db:seed
   ```

### Database Management

- **View database**: Open Prisma Studio to view and edit the database:
  ```bash
  bun run db:studio
  ```

- **Reset database**: Delete all data and reseed:
  ```bash
  bun run db:reset
  ```

- **Create new migration**: After changing the schema in `prisma/schema.prisma`:
  ```bash
  bun run db:migrate -- --name <migration-name>
  ```

## Development

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Architecture

The database is structured around these key entities:

- **Users**: Nostr identities that can access the system
- **Accounts**: Nostr identities that own content
- **Posts**: Nostr events (notes, articles, etc.)
- **Queues**: Organize content within an account
- **Schedules**: Associate posts with queues and define when they should be published
- **Subscriptions**: Track subscription status of accounts
- **Payments**: Track payment transactions

For more details, see the [ARCHITECTURE.md](context/ARCHITECTURE.md) and [SPEC.md](context/SPEC.md) files.

## API Routes

The application provides several API routes for interacting with the database:

- **GET /api/accounts?pubkey=<pubkey>**: Get all accounts a user has access to
- **POST /api/accounts**: Create a new account
- **GET /api/queues?accountPubkey=<pubkey>**: Get all queues for an account
- **POST /api/queues**: Create a new queue
- **DELETE /api/queues?id=<id>**: Delete a queue

## Service Layer

The database is accessed through a service layer that provides a clean API for interacting with the database:

```typescript
import { UserService, AccountService, PostService, QueueService, ScheduleService } from '@/lib/services';

// Example: Create a user
const user = await UserService.create('user-pubkey');

// Example: Get all queues for an account
const queues = await QueueService.getByAccount('account-pubkey');
```

## License

[MIT](LICENSE)
