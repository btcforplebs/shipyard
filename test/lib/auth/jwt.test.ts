import { describe, test, expect, mock, beforeAll, afterAll } from 'bun:test';
import { issueJWT, verifyJWT } from '../../../lib/auth/jwt';

describe('JWT Authentication', () => {
  // Save original environment variables
  const originalEnv = { ...process.env };
  
  beforeAll(() => {
    // Set up test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';
    process.env.JWT_EXPIRES_IN = '1h';
  });
  
  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  test('should issue a valid JWT token for a pubkey', async () => {
    const pubkey = '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234';
    
    const token = await issueJWT(pubkey);
    
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    
    // JWT format: header.payload.signature
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });
  
  test('should verify a valid JWT token and return the pubkey', async () => {
    const pubkey = '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234';
    
    const token = await issueJWT(pubkey);
    const result = await verifyJWT(token);
    
    expect(result.valid).toBe(true);
    expect(result.pubkey).toBe(pubkey);
  });
  
  test('should reject an invalid JWT token', async () => {
    const invalidToken = 'invalid.jwt.token';
    
    const result = await verifyJWT(invalidToken);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.pubkey).toBeUndefined();
  });
  
  test('should reject a tampered JWT token', async () => {
    const pubkey = '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234';
    
    const token = await issueJWT(pubkey);
    const parts = token.split('.');
    
    // Tamper with the payload part
    const tamperedToken = `${parts[0]}.${parts[1]}modified.${parts[2]}`;
    
    const result = await verifyJWT(tamperedToken);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.pubkey).toBeUndefined();
  });
  
  test('should reject an expired JWT token', async () => {
    // Mock Date.now to return a specific time
    const realDateNow = Date.now;
    const currentTime = Date.now();
    
    try {
      // First, create a token at the current time
      const pubkey = '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234';
      
      // Override JWT_EXPIRES_IN to a very short duration for testing
      process.env.JWT_EXPIRES_IN = '1s'; // 1 second
      
      const token = await issueJWT(pubkey);
      
      // Now mock Date.now to return a time in the future (after token expiration)
      Date.now = () => currentTime + 2000; // 2 seconds later
      
      const result = await verifyJWT(token);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
      expect(result.pubkey).toBeUndefined();
    } finally {
      // Restore the original Date.now
      Date.now = realDateNow;
      // Restore the original JWT_EXPIRES_IN
      process.env.JWT_EXPIRES_IN = '1h';
    }
  });
  
  test('should include custom claims in the JWT token', async () => {
    const pubkey = '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234';
    const customClaims = {
      role: 'user',
      permissions: ['read', 'write']
    };
    
    const token = await issueJWT(pubkey, customClaims);
    const result = await verifyJWT(token);
    
    expect(result.valid).toBe(true);
    expect(result.pubkey).toBe(pubkey);
    expect(result.claims?.role).toBe('user');
    expect(result.claims?.permissions).toEqual(['read', 'write']);
  });
  
  test('should handle missing JWT_SECRET environment variable', async () => {
    // Temporarily remove JWT_SECRET
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    try {
      const pubkey = '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234';
      
      await expect(issueJWT(pubkey)).rejects.toThrow();
    } finally {
      // Restore JWT_SECRET
      process.env.JWT_SECRET = savedSecret;
    }
  });
});