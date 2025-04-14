/*
  Warnings:

  - You are about to drop the column `raw_event` on the `posts` table. All the data in the column will be lost.
  - Added the required column `raw_events` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_pubkey" TEXT NOT NULL,
    "author_pubkey" TEXT NOT NULL,
    "kind" INTEGER NOT NULL,
    "raw_events" TEXT NOT NULL,
    "original_post_nostr_id" TEXT,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "nostr_event_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "posts_account_pubkey_fkey" FOREIGN KEY ("account_pubkey") REFERENCES "accounts" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "posts_author_pubkey_fkey" FOREIGN KEY ("author_pubkey") REFERENCES "users" ("pubkey") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_posts" ("account_pubkey", "author_pubkey", "created_at", "id", "is_draft", "kind", "nostr_event_id", "original_post_nostr_id", "updated_at") SELECT "account_pubkey", "author_pubkey", "created_at", "id", "is_draft", "kind", "nostr_event_id", "original_post_nostr_id", "updated_at" FROM "posts";
DROP TABLE "posts";
ALTER TABLE "new_posts" RENAME TO "posts";
CREATE UNIQUE INDEX "posts_nostr_event_id_key" ON "posts"("nostr_event_id");
CREATE INDEX "posts_account_pubkey_idx" ON "posts"("account_pubkey");
CREATE INDEX "posts_author_pubkey_idx" ON "posts"("author_pubkey");
CREATE INDEX "posts_is_draft_idx" ON "posts"("is_draft");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
