-- CreateTable
CREATE TABLE "users" (
    "pubkey" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "accounts" (
    "pubkey" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "settings" (
    "account_pubkey" TEXT NOT NULL PRIMARY KEY,
    "relays" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "settings_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT NOT NULL,
    "user_pubkey" TEXT NOT NULL,
    "can_create_drafts" BOOLEAN NOT NULL DEFAULT false,
    "can_schedule" BOOLEAN NOT NULL DEFAULT false,
    "can_publish" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_queues" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_collaborators" BOOLEAN NOT NULL DEFAULT false,
    "can_view_metrics" BOOLEAN NOT NULL DEFAULT false,
    "invitation_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "account_users_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "account_users_user_pubkey_fkey" FOREIGN KEY ("user_pubkey") REFERENCES "users" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT NOT NULL,
    "author_pubkey" TEXT NOT NULL,
    "kind" INTEGER NOT NULL,
    "raw_event" TEXT NOT NULL,
    "original_post_nostr_id" TEXT,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "nostr_event_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "posts_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "posts_author_pubkey_fkey" FOREIGN KEY ("author_pubkey") REFERENCES "users" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "queues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "queues_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "account_pubkey" TEXT NOT NULL,
    "author_pubkey" TEXT NOT NULL,
    "scheduled_at" DATETIME,
    "trigger_type" TEXT,
    "trigger_details" TEXT,
    "trigger_expires_at" DATETIME,
    "relays" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "publish_attempted_at" DATETIME,
    "publish_error" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "schedules_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedules_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedules_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedules_author_pubkey_fkey" FOREIGN KEY ("author_pubkey") REFERENCES "users" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_period_start" DATETIME,
    "current_period_end" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "payment_reference" TEXT,
    "payment_method" TEXT NOT NULL,
    "paid_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT,
    "user_pubkey" TEXT,
    "action" TEXT NOT NULL,
    "context" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_pubkey_fkey" FOREIGN KEY ("user_pubkey") REFERENCES "users" ("pubkey") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "account_users_account_pubkey_user_pubkey_key" ON "account_users"("account_pubkey", "user_pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "posts_nostr_event_id_key" ON "posts"("nostr_event_id");

-- CreateIndex
CREATE INDEX "posts_account_pubkey_idx" ON "posts"("account_pubkey");

-- CreateIndex
CREATE INDEX "posts_author_pubkey_idx" ON "posts"("author_pubkey");

-- CreateIndex
CREATE INDEX "posts_is_draft_idx" ON "posts"("is_draft");

-- CreateIndex
CREATE INDEX "queues_account_pubkey_idx" ON "queues"("account_pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "queues_account_pubkey_name_key" ON "queues"("account_pubkey", "name");

-- CreateIndex
CREATE INDEX "schedules_status_scheduled_at_idx" ON "schedules"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "schedules_account_pubkey_idx" ON "schedules"("account_pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_account_pubkey_key" ON "subscriptions"("account_pubkey");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
