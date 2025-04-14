import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { UserService } from '../../../lib/services/user';
import { prisma } from '../../../lib/db';

// Mock the Prisma client
mock.module('../../../lib/db', () => {
  return {
    prisma: {
      user: {
        findUnique: mock.fn(),
        create: mock.fn(),
      },
      accountUser: {
        findMany: mock.fn(),
      }
    }
  };
});

describe('UserService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mock.reset();
  });
  
  test('should get a user by pubkey when it exists', async () => {
    const mockUser = {
      pubkey: 'test-pubkey',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock the Prisma findUnique method to return a user
    prisma.user.findUnique = mock.fn(() => Promise.resolve(mockUser));
    
    const user = await UserService.getByPubkey('test-pubkey');
    
    expect(user).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        pubkey: 'test-pubkey'
      }
    });
  });
  
  test('should return null when getting a user that does not exist', async () => {
    // Mock the Prisma findUnique method to return null
    prisma.user.findUnique = mock.fn(() => Promise.resolve(null));
    
    const user = await UserService.getByPubkey('nonexistent-pubkey');
    
    expect(user).toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        pubkey: 'nonexistent-pubkey'
      }
    });
  });
  
  test('should create a new user', async () => {
    const mockUser = {
      pubkey: 'new-pubkey',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock the Prisma create method to return a new user
    prisma.user.create = mock.fn(() => Promise.resolve(mockUser));
    
    const user = await UserService.create('new-pubkey');
    
    expect(user).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        pubkey: 'new-pubkey'
      }
    });
  });
  
  test('should get or create a user when it exists', async () => {
    const mockUser = {
      pubkey: 'existing-pubkey',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock the Prisma findUnique method to return a user
    prisma.user.findUnique = mock.fn(() => Promise.resolve(mockUser));
    
    // Mock the create method to ensure it's not called
    const createSpy = mock.fn();
    UserService.create = createSpy;
    
    const user = await UserService.getOrCreate('existing-pubkey');
    
    expect(user).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        pubkey: 'existing-pubkey'
      }
    });
    expect(createSpy).not.toHaveBeenCalled();
    
    // Restore the original create method
    UserService.create = UserService.create;
  });
  
  test('should get or create a user when it does not exist', async () => {
    const mockUser = {
      pubkey: 'new-pubkey',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock the Prisma findUnique method to return null
    prisma.user.findUnique = mock.fn(() => Promise.resolve(null));
    
    // Mock the create method to return a new user
    const createSpy = mock.fn(() => Promise.resolve(mockUser));
    UserService.create = createSpy;
    
    const user = await UserService.getOrCreate('new-pubkey');
    
    expect(user).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        pubkey: 'new-pubkey'
      }
    });
    expect(createSpy).toHaveBeenCalledWith('new-pubkey');
    
    // Restore the original create method
    UserService.create = UserService.create;
  });
  
  test('should get all accounts a user has access to', async () => {
    const mockAccounts = [
      {
        id: '1',
        accountPubkey: 'account-1',
        userPubkey: 'test-pubkey',
        canCreateDrafts: true,
        canSchedule: true,
        canPublish: true,
        canManageQueues: false,
        canManageCollaborators: false,
        canViewMetrics: true,
        invitationStatus: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date(),
        account: {
          pubkey: 'account-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        id: '2',
        accountPubkey: 'account-2',
        userPubkey: 'test-pubkey',
        canCreateDrafts: true,
        canSchedule: false,
        canPublish: false,
        canManageQueues: false,
        canManageCollaborators: false,
        canViewMetrics: false,
        invitationStatus: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date(),
        account: {
          pubkey: 'account-2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ];
    
    // Mock the Prisma findMany method to return accounts
    prisma.accountUser.findMany = mock.fn(() => Promise.resolve(mockAccounts));
    
    const accounts = await UserService.getAccounts('test-pubkey');
    
    expect(accounts).toEqual(mockAccounts);
    expect(prisma.accountUser.findMany).toHaveBeenCalledWith({
      where: {
        userPubkey: 'test-pubkey'
      },
      include: {
        account: true
      }
    });
  });
  
  test('should handle errors when getting a user', async () => {
    // Mock the Prisma findUnique method to throw an error
    prisma.user.findUnique = mock.fn(() => {
      throw new Error('Database error');
    });
    
    await expect(UserService.getByPubkey('test-pubkey')).rejects.toThrow('Database error');
  });
  
  test('should handle errors when creating a user', async () => {
    // Mock the Prisma create method to throw an error
    prisma.user.create = mock.fn(() => {
      throw new Error('Database error');
    });
    
    await expect(UserService.create('test-pubkey')).rejects.toThrow('Database error');
  });
  
  test('should handle errors when getting accounts', async () => {
    // Mock the Prisma findMany method to throw an error
    prisma.accountUser.findMany = mock.fn(() => {
      throw new Error('Database error');
    });
    
    await expect(UserService.getAccounts('test-pubkey')).rejects.toThrow('Database error');
  });
});