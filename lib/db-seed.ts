import { prisma } from './db';
import { 
  UserService, 
  AccountService, 
  QueueService 
} from './services';

/**
 * Seeds the database with initial data for development and testing
 */
export async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Create a test user
    const testUserPubkey = 'test-user-pubkey';
    const testUser = await UserService.getOrCreate(testUserPubkey);
    console.log('Created test user:', testUser.pubkey);

    // Create a test account
    const testAccountPubkey = 'test-account-pubkey';
    const testAccount = await AccountService.getOrCreate(testAccountPubkey);
    console.log('Created test account:', testAccount.pubkey);

    // Add settings to the test account
    await AccountService.updateSettings(testAccountPubkey, {
      relays: ['wss://relay.damus.io', 'wss://relay.nostr.band'],
    });
    console.log('Added settings to test account');

    // Add the test user to the test account with full permissions
    await AccountService.addUser(testAccountPubkey, testUserPubkey, {
      canCreateDrafts: true,
      canSchedule: true,
      canPublish: true,
      canManageQueues: true,
      canManageCollaborators: true,
      canViewMetrics: true,
    }, 'accepted');
    console.log('Added test user to test account with full permissions');

    // Create default queues
    const defaultQueues = ['General', 'Announcements', 'Blog Posts'];
    for (const queueName of defaultQueues) {
      await QueueService.getOrCreate(testAccountPubkey, queueName);
      console.log(`Created queue: ${queueName}`);
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

/**
 * Resets the database by deleting all data
 * WARNING: This will delete all data in the database
 */
export async function resetDatabase() {
  console.log('Resetting database...');

  try {
    // Delete all data in reverse order of dependencies
    await prisma.auditLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.post.deleteMany();
    await prisma.queue.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.accountUser.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// If this file is executed directly, seed the database
if (require.main === module) {
  (async () => {
    try {
      await resetDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed database:', error);
      process.exit(1);
    }
  })();
}