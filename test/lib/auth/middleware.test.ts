import { describe, test, expect, mock, beforeAll, afterAll } from 'bun:test';
import { authMiddleware } from '../../../lib/auth/middleware';
import { issueJWT } from '../../../lib/auth/jwt';

// Mock the verifyJWT function
mock.module('../../../lib/auth/jwt', () => {
  return {
    verifyJWT: mock((token: string) => {
      if (token === 'valid.jwt.token') {
        return Promise.resolve({
          valid: true,
          pubkey: 'test-pubkey-123',
          claims: { role: 'user' }
        });
      } else if (token === 'expired.jwt.token') {
        return Promise.resolve({
          valid: false,
          error: 'Token expired'
        });
      } else {
        return Promise.resolve({
          valid: false,
          error: 'Invalid token'
        });
      }
    }),
    issueJWT: mock((pubkey: string, claims?: any) => {
      return Promise.resolve('valid.jwt.token');
    })
  };
});

describe('Auth Middleware', () => {
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
  
  test('should pass request with valid JWT token', async () => {
    // Create a mock request and response
    const req: any = {
      headers: {
        authorization: 'Bearer valid.jwt.token'
      }
    };
    const res = {
      status: mock.fn(() => res),
      json: mock.fn()
    };
    const next = mock.fn();
    
    await authMiddleware(req, res, next);
    
    // Check that next was called (middleware passed)
    expect(next).toHaveBeenCalled();
    
    // Check that pubkey was attached to request
    expect(req).toHaveProperty('pubkey', 'test-pubkey-123');
    
    // Check that claims were attached to request
    expect(req).toHaveProperty('claims');
    expect(req.claims).toHaveProperty('role', 'user');
    
    // Check that response methods were not called
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  test('should reject request with missing authorization header', async () => {
    // Create a mock request and response
    const req: any = {
      headers: {}
    };
    const res = {
      status: mock.fn(() => res),
      json: mock.fn()
    };
    const next = mock.fn();
    
    await authMiddleware(req, res, next);
    
    // Check that next was not called (middleware blocked)
    expect(next).not.toHaveBeenCalled();
    
    // Check that response methods were called with correct arguments
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('authorization')
    }));
  });
  
  test('should reject request with invalid authorization format', async () => {
    // Create a mock request and response
    const req: any = {
      headers: {
        authorization: 'InvalidFormat'
      }
    };
    const res = {
      status: mock.fn(() => res),
      json: mock.fn()
    };
    const next = mock.fn();
    
    await authMiddleware(req, res, next);
    
    // Check that next was not called (middleware blocked)
    expect(next).not.toHaveBeenCalled();
    
    // Check that response methods were called with correct arguments
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('format')
    }));
  });
  
  test('should reject request with expired JWT token', async () => {
    // Create a mock request and response
    const req: any = {
      headers: {
        authorization: 'Bearer expired.jwt.token'
      }
    };
    const res = {
      status: mock.fn(() => res),
      json: mock.fn()
    };
    const next = mock.fn();
    
    await authMiddleware(req, res, next);
    
    // Check that next was not called (middleware blocked)
    expect(next).not.toHaveBeenCalled();
    
    // Check that response methods were called with correct arguments
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('expired')
    }));
  });
  
  test('should reject request with invalid JWT token', async () => {
    // Create a mock request and response
    const req = {
      headers: {
        authorization: 'Bearer invalid.jwt.token'
      }
    };
    const res = {
      status: mock.fn(() => res),
      json: mock.fn()
    };
    const next = mock.fn();
    
    await authMiddleware(req, res, next);
    
    // Check that next was not called (middleware blocked)
    expect(next).not.toHaveBeenCalled();
    
    // Check that response methods were called with correct arguments
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Invalid')
    }));
  });
  
  test('should handle optional authentication', async () => {
    // Create a mock request and response
    const req: any = {
      headers: {}
    };
    const res = {
      status: mock.fn(() => res),
      json: mock.fn()
    };
    const next = mock.fn();
    
    // Call middleware with optional flag
    await authMiddleware(req, res, next, { optional: true });
    
    // Check that next was called (middleware passed)
    expect(next).toHaveBeenCalled();
    
    // Check that pubkey was not attached to request
    expect(req).not.toHaveProperty('pubkey');
    
    // Check that response methods were not called
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});