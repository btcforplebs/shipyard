#!/usr/bin/env bun

/**
 * This script seeds the database with initial data for development and testing.
 * Run it with: bun run scripts/seed-db.ts
 */

import { seedDatabase, resetDatabase } from '../lib/db-seed';

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');

  try {
    if (shouldReset) {
      console.log('Resetting database...');
      await resetDatabase();
    }

    console.log('Seeding database...');
    await seedDatabase();
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();