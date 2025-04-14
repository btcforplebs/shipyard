import { describe, test, expect } from 'bun:test';
import { NostrEventSchema, NIP98AuthEventSchema } from '../../../lib/nostr/schemas';

describe('NostrEventSchema', () => {
  test('should validate a valid Nostr event', () => {
    const validEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [['e', '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234']],
      content: 'Hello, world!',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NostrEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });
  
  test('should reject an event with missing required fields', () => {
    const invalidEvent = {
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [],
      content: 'Hello, world!'
      // Missing id and sig
    };
    
    const result = NostrEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('id'))).toBe(true);
      expect(result.error.issues.some(issue => issue.path.includes('sig'))).toBe(true);
    }
  });
  
  test('should reject an event with invalid id format', () => {
    const invalidEvent = {
      id: 'not-a-valid-hex-id',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [],
      content: 'Hello, world!',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NostrEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('id'))).toBe(true);
    }
  });
  
  test('should reject an event with invalid pubkey format', () => {
    const invalidEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: 'not-a-valid-hex-pubkey',
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [],
      content: 'Hello, world!',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NostrEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('pubkey'))).toBe(true);
    }
  });
  
  test('should reject an event with invalid signature format', () => {
    const invalidEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [],
      content: 'Hello, world!',
      sig: 'not-a-valid-signature'
    };
    
    const result = NostrEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('sig'))).toBe(true);
    }
  });
});

describe('NIP98AuthEventSchema', () => {
  test('should validate a valid NIP-98 auth event', () => {
    const now = Math.floor(Date.now() / 1000);
    const validAuthEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: now,
      kind: 27235, // NIP-98 auth event kind
      tags: [
        ['u', 'https://api.example.com/login'],
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', now.toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NIP98AuthEventSchema.safeParse(validAuthEvent);
    expect(result.success).toBe(true);
  });
  
  test('should reject an auth event with wrong kind', () => {
    const now = Math.floor(Date.now() / 1000);
    const invalidAuthEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: now,
      kind: 1, // Wrong kind for auth event
      tags: [
        ['u', 'https://api.example.com/login'],
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', now.toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NIP98AuthEventSchema.safeParse(invalidAuthEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('kind'))).toBe(true);
    }
  });
  
  test('should reject an auth event missing required tags', () => {
    const validAuthEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: Math.floor(Date.now() / 1000),
      kind: 27235,
      tags: [
        // Missing 'u' tag
        ['method', 'POST'],
        ['payload', '']
        // Missing 'created_at' tag
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NIP98AuthEventSchema.safeParse(validAuthEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
  
  test('should reject an auth event with invalid URL in u tag', () => {
    const now = Math.floor(Date.now() / 1000);
    const invalidAuthEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: now,
      kind: 27235,
      tags: [
        ['u', 'not-a-valid-url'], // Invalid URL
        ['method', 'POST'],
        ['payload', ''],
        ['created_at', now.toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NIP98AuthEventSchema.safeParse(invalidAuthEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => 
        issue.message.includes('URL') || 
        issue.message.includes('url')
      )).toBe(true);
    }
  });
  
  test('should reject an auth event with invalid HTTP method', () => {
    const now = Math.floor(Date.now() / 1000);
    const invalidAuthEvent = {
      id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      created_at: now,
      kind: 27235,
      tags: [
        ['u', 'https://api.example.com/login'],
        ['method', 'INVALID_METHOD'], // Invalid HTTP method
        ['payload', ''],
        ['created_at', now.toString()]
      ],
      content: '',
      sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
    };
    
    const result = NIP98AuthEventSchema.safeParse(invalidAuthEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => 
        issue.message.includes('method') || 
        issue.message.includes('HTTP')
      )).toBe(true);
    }
  });
});