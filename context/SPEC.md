# Shipyard - Specification Document

## 1. Overview

Shipyard is a web-based application designed to provide a focused environment for creating, managing, and scheduling content for the decentralized Nostr protocol. It targets Nostr users, particularly content creators, who require advanced planning, organization, and collaboration features beyond those offered by typical Nostr clients.

## 2. Goals

*   Simplify the process of composing and publishing content (notes, threads, articles) to Nostr.
*   Provide robust scheduling capabilities, including time-based and potentially trigger-based options.
*   Enable users to organize upcoming content using queues and different views (list, calendar).
*   Facilitate collaboration by allowing users to grant publishing permissions to others.
*   Offer a clean, distraction-free user interface with support for multiple Nostr accounts.
*   Potentially offer premium features via a subscription model.

## 3. Key Features (Functional Requirements)

### 3.1. Authentication & Account Management

*   **Login Methods:** Users must be able to log in using:
    *   Nostr Browser Extension (NIP-07).
    *   Remote Signer (e.g., nsecBunker via connection string).
    *   Nostr Private Key (nsec).
*   **Session Persistence:** Login sessions should be securely persisted on the client device (currently using `localStorage`).
*   **Account Switching:** Users must be able to add multiple Nostr accounts and switch between them easily within the application.
*   **Profile Settings:** Users should be able to view and potentially update their Nostr profile information (Display Name, Username/NIP-05, Bio, Website, Avatar). Changes should ideally be published as Nostr profile events (kind:0).
*   **Key Management:** Users must be able to view their public key (npub). Private keys (nsec), if entered directly, should be stored securely (e.g., encrypted locally) and ideally only displayed obfuscated or upon explicit user action. Copy-to-clipboard functionality for keys should be provided.

### 3.2. Content Creation

*   **Short-form Composer:**
    *   Ability to compose single notes or threads (sequences of connected notes).
    *   Character count display per note (e.g., 280 characters).
    *   Support for adding/removing notes within a thread.
    *   Ability to quote an existing Nostr note within the first note of a thread.
    *   (Optional) Support for attaching images.
*   **Long-form Composer:**
    *   Ability to compose article-style content with a title and body.
    *   Basic rich-text formatting options (Bold, Italic, Underline, Headings, Lists, Links).
    *   (Implied) Content should be publishable as Nostr long-form events (e.g., NIP-23).
*   **Drafts:** Users must be able to save both short-form and long-form content as drafts before scheduling or publishing.

### 3.3. Scheduling & Publishing

*   **Time-based Scheduling:**
    *   Users must be able to select a specific date and time for publishing content.
    *   Users must be able to select a timezone for the schedule.
    *   Scheduled content should be added to a selected queue.
*   **Trigger-based Scheduling (Premium Feature):**
    *   (Pro Plan) Ability to schedule content based on triggers like:
        *   Specific user coming online.
        *   Mention of specific keywords.
        *   Reaching an engagement threshold (details TBD).
    *   Option for triggered posts to expire if the condition isn't met within a timeframe (e.g., 24 hours).
*   **Repost/Quote Scheduling:**
    *   Users must be able to schedule a repost (boost) of an existing Nostr note.
    *   Users must be able to schedule a quote of an existing Nostr note (initiating the short-form composer with the quote attached).
*   **Publishing:** The application must handle the signing and publishing of scheduled content to configured/default Nostr relays at the specified time or when triggered.

### 3.4. Queue Management

*   **Queue Creation:** Users must be able to create named queues with optional descriptions.
*   **Queue Selection:** Users must be able to select which queue a piece of content belongs to during scheduling.
*   **Queue Viewing:**
    *   **List View:** Display scheduled content chronologically within the selected queue(s).
    *   **Calendar View:** Display scheduled content on a calendar, allowing users to see posts planned for specific dates.
*   **Queue Filtering:** Users must be able to filter the view to show content from all queues or a specific queue.
*   **Content Interaction:** From the queue views, users should be able to:
    *   View scheduled content details.
    *   Edit scheduled content (if not yet published).
    *   Reschedule content.
    *   Delete scheduled content.

### 3.5. Collaboration

*   **Invite Collaborators:** Account owners must be able to invite other Nostr users (via NIP-05 or npub) to collaborate.
*   **Permissions:** Account owners must be able to assign permissions to collaborators (e.g., create drafts, publish content, schedule content).
*   **Manage Collaborators:** Account owners must be able to view current collaborators, edit their permissions, and remove them.

### 3.6. Dashboard

*   Display summary statistics:
    *   Number of scheduled posts.
    *   Number of drafts.
    *   Number of published posts (requires tracking).
    *   Engagement metrics (requires tracking/fetching Nostr data).
*   Provide quick access to the content queue (list/calendar view).

### 3.7. Subscription Management

*   Display the user's current subscription plan (Free, Pro, Custom).
*   Allow users to select or change their subscription plan.
*   Handle custom payment amounts for the "Custom" tier.
*   Display the features included in the Pro plan.
*   Provide options to update or cancel the subscription. (Requires integration with a payment provider).

## 4. Non-Functional Requirements

*   **Platform:** Web Application, accessible via modern browsers.
*   **Responsiveness:** The UI must adapt to different screen sizes (desktop, tablet, mobile).
*   **User Interface:** Clean, intuitive, and consistent design based on Shadcn/UI. Support for Light and Dark themes.
*   **Persistence:** Requires a robust backend and database to reliably store user data, content drafts, schedules, collaborator information, and subscription status. (Currently relies only on `localStorage` and Nostr).
*   **Decentralization:** Core publishing and identity functions must leverage the Nostr protocol.
*   **Security:** Sensitive data like private keys must be handled securely (e.g., stored encrypted if necessary, avoided if possible via NIP-07/nsecBunker). Communication with payment providers (if implemented) must be secure.
*   **Performance:** The application should feel responsive, especially the content editors and queue views.

## 5. Future Considerations

*   Detailed analytics and engagement tracking for published posts.
*   Integration with image hosting services for easier media attachments.
*   More advanced scheduling trigger options.
*   Team-based features beyond simple collaboration.
*   Content approval workflows for collaborators.

---

# Database

## 1. Overview

Shipyard is a powerful Nostr-native content management and scheduling platform built around the concepts of **Accounts** (Nostr pubkeys), **Posts**, and **Schedules**. It allows for flexible collaboration, content queues, advanced scheduling (time- and trigger-based), and subscription billing via Payments.

## 2. Primary Concepts

### Account
- Represents a Nostr identity (`pubkey`) used to publish content.
- Owns all Posts, Queues, and Schedules.
- Subscription and Settings are associated directly with the Account.

### User
- Identified by a Nostr `pubkey`.
- Can collaborate on multiple Accounts with explicit boolean permissions via the `AccountUsers` join table.

### Post
- Represents a complete Nostr event stored as `raw_event`.
- Each Post has a `kind` and an `author_pubkey` (user who created it).
- Draft status is tracked via `is_draft`.

### Schedule
- Associates a Post with a Queue and defines when it should be published.
- Supports both time-based and trigger-based scheduling.
- Contains `relays[]` to define target publication relays.

### Queue
- Organizes content within an Account for visual and workflow grouping.
- Can be used to manage publishing cadence and categorization.

### Subscription
- Each Account can have one active Subscription (status-driven).
- Payments are stored separately with full tracking of method, amount, currency, and provider reference.

### Settings
- Account-level defaults, such as relays to publish to, are stored here.

### Audit Logs
- Track key actions taken within the system for debugging, accountability, and analysis.

---

## 3. Database Schema

```sql
-- USERS
CREATE TABLE Users (
    pubkey VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCOUNTS
CREATE TABLE Accounts (
    pubkey VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCOUNT SETTINGS
CREATE TABLE Settings (
    account_pubkey VARCHAR(64) PRIMARY KEY REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    relays TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCOUNT USERS (Memberships)
CREATE TABLE AccountUsers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_pubkey VARCHAR(64) NOT NULL REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    user_pubkey VARCHAR(64) NOT NULL REFERENCES Users(pubkey) ON DELETE CASCADE,

    can_create_drafts BOOLEAN DEFAULT FALSE NOT NULL,
    can_schedule BOOLEAN DEFAULT FALSE NOT NULL,
    can_publish BOOLEAN DEFAULT FALSE NOT NULL,
    can_manage_queues BOOLEAN DEFAULT FALSE NOT NULL,
    can_manage_collaborators BOOLEAN DEFAULT FALSE NOT NULL,
    can_view_metrics BOOLEAN DEFAULT FALSE NOT NULL,

    invitation_status VARCHAR(20) DEFAULT 'pending'
        CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (account_pubkey, user_pubkey)
);

-- POSTS
CREATE TABLE Posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_pubkey VARCHAR(64) NOT NULL REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    author_pubkey VARCHAR(64) NOT NULL REFERENCES Users(pubkey) ON DELETE CASCADE,
    kind INT NOT NULL,
    raw_event JSONB NOT NULL,
    original_post_nostr_id VARCHAR(64),
    is_draft BOOLEAN DEFAULT TRUE,
    nostr_event_id VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_posts_account (account_pubkey),
    INDEX idx_posts_author (author_pubkey),
    INDEX idx_posts_draft (is_draft)
);

-- QUEUES
CREATE TABLE Queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_pubkey VARCHAR(64) NOT NULL REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (account_pubkey, name),
    INDEX idx_queues_account (account_pubkey)
);

-- SCHEDULES
CREATE TABLE Schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES Posts(id) ON DELETE CASCADE,
    queue_id UUID NOT NULL REFERENCES Queues(id) ON DELETE CASCADE,
    account_pubkey VARCHAR(64) NOT NULL REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    author_pubkey VARCHAR(64) NOT NULL REFERENCES Users(pubkey) ON DELETE CASCADE,

    scheduled_at TIMESTAMPTZ,
    trigger_type VARCHAR(50)
        CHECK (trigger_type IN ('time', 'user_online', 'keyword', 'engagement')),
    trigger_details JSONB,
    trigger_expires_at TIMESTAMPTZ,

    relays TEXT[] NOT NULL DEFAULT '{}',

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'published', 'failed', 'expired')),
    publish_attempted_at TIMESTAMPTZ,
    publish_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_schedules_status_time (status, scheduled_at),
    INDEX idx_schedules_account (account_pubkey)
);

-- SUBSCRIPTIONS
CREATE TABLE Subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_pubkey VARCHAR(64) NOT NULL UNIQUE REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('active', 'canceled', 'past_due')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_subscriptions_status (status)
);

-- PAYMENTS
CREATE TABLE Payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_pubkey VARCHAR(64) NOT NULL REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL, -- e.g., 'USD', 'BTC'
    payment_reference VARCHAR(255), -- e.g., Stripe session ID, txid
    payment_method VARCHAR(50), -- e.g., 'stripe', 'lightning', 'credit_card'
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE AuditLogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_pubkey VARCHAR(64) REFERENCES Accounts(pubkey) ON DELETE CASCADE,
    user_pubkey VARCHAR(64) REFERENCES Users(pubkey) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    context JSONB, -- Optional metadata related to the action
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ATTACH TRIGGERS
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON Users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_accounts BEFORE UPDATE ON Accounts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_account_users BEFORE UPDATE ON AccountUsers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_posts BEFORE UPDATE ON Posts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_queues BEFORE UPDATE ON Queues FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_schedules BEFORE UPDATE ON Schedules FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_subscriptions BEFORE UPDATE ON Subscriptions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_settings BEFORE UPDATE ON Settings FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
```

## 4. Implementation Details

### Database Technology

The database is implemented using:

- **SQLite**: A lightweight, file-based database that provides excellent performance for the application's needs while maintaining simplicity of deployment.
- **Prisma ORM**: A modern TypeScript ORM that provides type-safe database access, schema migrations, and a clean API for interacting with the database.

### Key Adaptations for SQLite

While the schema above is written in PostgreSQL syntax, the actual implementation uses SQLite with the following adaptations:

1. **Array Types**: SQLite doesn't natively support array types like `TEXT[]`. These are stored as JSON strings and parsed/serialized in the application code.
2. **JSON Types**: Similarly, `JSONB` fields are stored as text strings in SQLite.
3. **UUID Generation**: SQLite doesn't have a built-in UUID generator, so UUIDs are generated using the Prisma client.
4. **Timestamp Handling**: `TIMESTAMPTZ` is replaced with SQLite's `DATETIME` type.
5. **Indexes**: The index syntax is adapted to SQLite's capabilities.

### Service Layer

The database is accessed through a service layer that provides a clean API for interacting with the database. This layer:

1. Handles the serialization/deserialization of JSON data
2. Provides type-safe methods for common operations
3. Abstracts away the details of the ORM implementation
4. Enforces business rules and constraints

The service layer is organized into modules corresponding to the main entities:

- `UserService`: Managing users
- `AccountService`: Managing accounts and their settings
- `PostService`: Managing posts and drafts
- `QueueService`: Managing content queues
- `ScheduleService`: Managing scheduled publications

### Migration Strategy

Database migrations are managed through Prisma's migration system, which:

1. Tracks schema changes in version control
2. Provides a clean way to apply migrations in development and production
3. Ensures database schema consistency across environments

Initial migrations have been created to set up the database schema, and future schema changes will be managed through additional migrations.
