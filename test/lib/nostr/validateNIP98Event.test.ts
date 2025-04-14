import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { validateNIP98Event } from '../../../lib/nostr/validateNIP98Event';
import ndk from '../../../lib/nostr/ndk';

// Mock the NDK instance
mock.module('../../../lib/nostr/ndk', () => {
  return {
    default: {
      verifyEvent: mock((event) => Promise.resolve(true))
    }
  };
});

describe('validateNIP98Event', () => {
  const validEvent = {
    id: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
    pubkey: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
    created_at: Math.floor(Date.now() / 1000),
    kind: 27235,
    tags: [
      ['u', 'https://api.example.com/login'],
      ['method', 'POST'],
      ['payload', ''],
      ['created_at', Math.floor(Date.now() / 1000).toString()]
    ],
    content: '',
    sig: '123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    mock.reset();
  });
  
  test('should validate a valid NIP-98 event', async () => {
    const result = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60
    });
    
    expect(result.valid).toBe(true);
    expect(result.pubkey).toBe(validEvent.pubkey);
  });
  
  test('should reject an event with invalid signature', async () => {
    // Mock the NDK verifyEvent to return false (invalid signature)
    ndk.verifyEvent = mock.fn(() => Promise.resolve(false));
    
    const result = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('signature');
  });
  
  test('should reject an event that is too old', async () => {
    const oldEvent = {
      ...validEvent,
      created_at: Math.floor(Date.now() / 1000) - 120, // 2 minutes old
    };
    
    const result = await validateNIP98Event(oldEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60 // 1 minute max age
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });
  
  test('should reject an event from the future', async () => {
    const futureEvent = {
      ...validEvent,
      created_at: Math.floor(Date.now() / 1000) + 120, // 2 minutes in the future
    };
    
    const result = await validateNIP98Event(futureEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('future');
  });
  
  test('should reject an event with mismatched URL', async () => {
    const result = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/different-path',
      method: 'POST',
      maxAgeSecs: 60
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('URL');
  });
  
  test('should reject an event with mismatched method', async () => {
    const result = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'GET', // Different method
      maxAgeSecs: 60
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('method');
  });
  
  test('should reject an event missing required tags', async () => {
    const eventMissingTags = {
      ...validEvent,
      tags: [
        ['u', 'https://api.example.com/login'],
        // Missing method tag
        ['payload', '']
      ]
    };
    
    const result = await validateNIP98Event(eventMissingTags, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('tag');
  });
  
  test('should handle replay protection', async () => {
    // First call should succeed
    const result1 = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60,
      checkReplay: true
    });
    
    expect(result1.valid).toBe(true);
    
    // Second call with the same event ID should fail
    const result2 = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60,
      checkReplay: true
    });
    
    expect(result2.valid).toBe(false);
    expect(result2.error).toContain('replay');
  });
  
  test('should skip replay protection if not enabled', async () => {
    // First call
    const result1 = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60,
      checkReplay: false
    });
    
    expect(result1.valid).toBe(true);
    
    // Second call with the same event ID should still succeed
    const result2 = await validateNIP98Event(validEvent, {
      url: 'https://api.example.com/login',
      method: 'POST',
      maxAgeSecs: 60,
      checkReplay: false
    });
    
    expect(result2.valid).toBe(true);
  });
});