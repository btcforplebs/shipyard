import { describe, test, expect, mock, beforeAll, afterAll } from 'bun:test';
import { validateNIP98Event } from '../../../../../lib/nostr/validateNIP98Event';
import { UserService } from '../../../../../lib/services/user';
import { issueJWT } from '../../../../../lib/auth/jwt';
import { POST } from '../../../../../app/api/auth/login/route';

// Mock the validateNIP98Event function
mock.module('../../../../../lib/nostr/validateNIP98Event', () => {
  return {
    validateNIP98Event: mock((event: any, options: any) => {
      if (event.pubkey === 'valid-pubkey') {
        return Promise.resolve({
          valid: true,
          pubkey: event.pubkey
        });
      } else if (event.pubkey === 'invalid-signature') {
        return Promise.resolve({
          valid: false,
          error: 'Invalid signature'
        });
      } else if (event.pubkey === 'expired') {
        return Promise.resolve({
          valid: false,
          error: 'Event expired'
        });
      } else {
        return Promise.resolve({
          valid: false,
          error: 'Invalid event'
        });
      }
    })
  };
});

// Mock the UserService
mock.module('../../../../../lib/services/user', () => {
  return {
    UserService: {
      getOrCreate: mock((pubkey: string) => {
        return Promise.resolve({
          pubkey,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      })
    }
  };
});

// Mock the issueJWT function
mock.module('../../../../../lib/auth/jwt', () => {
  return {
    issueJWT: mock((pubkey: string, claims?: any) => {
      return Promise.resolve('mock.jwt.token');
    })
  };
});

describe('Login API Route', () => {
  // Save original environment variables
  const originalEnv = { ...process.env };
  
  beforeAll(() => {
    // Set up test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';
  });
  
  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  test('should authenticate with valid NIP-98 event', async () => {
    // Create a valid NIP-98 event
    const validEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: 'valid-pubkey',
      created_at: Math.floor(Date.now() / 1000),
      kind: 27235,
      tags: [
        ['u', 'https://api.example.com/api/auth/login'],
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', Math.floor(Date.now() / 1000).toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    // Create a mock request
    const request = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Nostr ${JSON.stringify(validEvent)}`
      }
    });
    
    // Call the route handler
    const response = await POST(request);
    
    // Check the response
    expect(response.status).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check that the token is returned
    expect(body).toHaveProperty('token', 'mock.jwt.token');
    
    // Check that validateNIP98Event was called with the correct arguments
    expect(validateNIP98Event).toHaveBeenCalledWith(
      validEvent,
      expect.objectContaining({
        url: 'https://api.example.com/api/auth/login',
        method: 'POST'
      })
    );
    
    // Check that UserService.getOrCreate was called with the correct pubkey
    expect(UserService.getOrCreate).toHaveBeenCalledWith('valid-pubkey');
    
    // Check that issueJWT was called with the correct pubkey
    expect(issueJWT).toHaveBeenCalledWith('valid-pubkey');
  });
  
  test('should reject request with missing authorization header', async () => {
    // Create a mock request without authorization header
    const request = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Call the route handler
    const response = await POST(request);
    
    // Check the response
    expect(response.status).toBe(401);
    
    // Parse the response body
    const body = await response.json();
    
    // Check the error message
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('authorization');
  });
  
  test('should reject request with invalid authorization format', async () => {
    // Create a mock request with invalid authorization format
    const request = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'InvalidFormat'
      }
    });
    
    // Call the route handler
    const response = await POST(request);
    
    // Check the response
    expect(response.status).toBe(401);
    
    // Parse the response body
    const body = await response.json();
    
    // Check the error message
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('format');
  });
  
  test('should reject request with invalid NIP-98 event', async () => {
    // Create an invalid NIP-98 event
    const invalidEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: 'invalid-signature',
      created_at: Math.floor(Date.now() / 1000),
      kind: 27235,
      tags: [
        ['u', 'https://api.example.com/api/auth/login'],
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', Math.floor(Date.now() / 1000).toString()]
      ],
      content: '',
      sig: 'invalid-signature'
    };
    
    // Create a mock request
    const request = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Nostr ${JSON.stringify(invalidEvent)}`
      }
    });
    
    // Call the route handler
    const response = await POST(request);
    
    // Check the response
    expect(response.status).toBe(401);
    
    // Parse the response body
    const body = await response.json();
    
    // Check the error message
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('signature');
  });
  
  test('should reject request with expired NIP-98 event', async () => {
    // Create an expired NIP-98 event
    const expiredEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: 'expired',
      created_at: Math.floor(Date.now() / 1000) - 120, // 2 minutes old
      kind: 27235,
      tags: [
        ['u', 'https://api.example.com/api/auth/login'],
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', (Math.floor(Date.now() / 1000) - 120).toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    // Create a mock request
    const request = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Nostr ${JSON.stringify(expiredEvent)}`
      }
    });
    
    // Call the route handler
    const response = await POST(request);
    
    // Check the response
    expect(response.status).toBe(401);
    
    // Parse the response body
    const body = await response.json();
    
    // Check the error message
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('expired');
  });
  
  test('should handle errors during user creation', async () => {
    // Mock UserService.getOrCreate to throw an error
    UserService.getOrCreate = mock.fn(() => {
      throw new Error('Database error');
    });
    
    // Create a valid NIP-98 event
    const validEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: 'valid-pubkey',
      created_at: Math.floor(Date.now() / 1000),
      kind: 27235,
      tags: [
        ['u', 'https://api.example.com/api/auth/login'],
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', Math.floor(Date.now() / 1000).toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    // Create a mock request
    const request = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Nostr ${JSON.stringify(validEvent)}`
      }
    });
    
    // Call the route handler
    const response = await POST(request);
    
    // Check the response
    expect(response.status).toBe(500);
    
    // Parse the response body
    const body = await response.json();
    
    // Check the error message
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('server');
  });
});