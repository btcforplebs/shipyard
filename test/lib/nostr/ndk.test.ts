import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import NDK, { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';

// Mock the NDK and NDKCacheAdapterDexie
mock.module('@nostr-dev-kit/ndk', () => {
  const mockConnect = mock(() => Promise.resolve());
  
  return {
    default: class MockNDK {
      explicitRelayUrls: string[];
      cacheAdapter: any;
      
      constructor(opts: { explicitRelayUrls?: string[], cacheAdapter?: any }) {
        this.explicitRelayUrls = opts.explicitRelayUrls || [];
        this.cacheAdapter = opts.cacheAdapter;
      }
      
      connect = mockConnect;
    },
    NDKNip07Signer: class MockNDKNip07Signer {},
    NDKPrivateKeySigner: class MockNDKPrivateKeySigner {
      privateKey: string | undefined;
      
      constructor(privateKey?: string) {
        this.privateKey = privateKey;
      }
    }
  };
});

mock.module('@nostr-dev-kit/ndk-cache-dexie', () => {
  return {
    default: class MockNDKCacheAdapterDexie {
      dbName: string;
      
      constructor(opts: { dbName: string }) {
        this.dbName = opts.dbName;
      }
    }
  };
});

// Now import the module under test (after mocking its dependencies)
import ndkInstance, { serializeSigner, deserializeSigner } from '../../../lib/nostr/ndk';

describe('NDK Singleton', () => {
  // Save and restore the original window object
  const originalWindow = global.window;
  
  beforeEach(() => {
    // Mock window for browser environment tests
    global.window = {} as any;
  });
  
  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
  });
  
  test('should export an NDK instance', () => {
    expect(ndkInstance).toBeInstanceOf(NDK);
  });
  
  test('should be configured with explicit relays', () => {
    const expectedRelays = ["wss://relay.damus.io", "wss://relay.primal.net", "wss://nos.lol", "wss://purplepag.es"];
    expect(ndkInstance.explicitRelayUrls).toEqual(expectedRelays);
  });
  
  test('should attempt to connect on initialization', () => {
    // This is hard to test directly since the connection happens during import
    // We'd need to refactor the module to make this more testable
    expect(ndkInstance.connect).toHaveBeenCalled();
  });
});

describe('Signer Serialization', () => {
  test('should serialize NIP-07 signer correctly', () => {
    const signer = new NDKNip07Signer();
    const serialized = serializeSigner(signer);
    
    expect(serialized).toEqual({ type: 'nip07' });
  });
  
  test('should serialize private key signer correctly', () => {
    const privateKey = 'nsec1abc123';
    const signer = new NDKPrivateKeySigner(privateKey);
    const serialized = serializeSigner(signer);
    
    expect(serialized).toEqual({ type: 'privateKey', data: privateKey });
  });
  
  test('should return null for unsupported signer types', () => {
    const unsupportedSigner = {} as any;
    const serialized = serializeSigner(unsupportedSigner);
    
    expect(serialized).toBeNull();
  });
});

describe('Signer Deserialization', () => {
  test('should deserialize NIP-07 signer correctly', () => {
    const serialized = { type: 'nip07' as const };
    const signer = deserializeSigner(serialized);
    
    expect(signer).toBeInstanceOf(NDKNip07Signer);
  });
  
  test('should deserialize private key signer correctly', () => {
    const privateKey = 'nsec1abc123';
    const serialized = { type: 'privateKey' as const, data: privateKey };
    const signer = deserializeSigner(serialized);
    
    expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
    expect((signer as NDKPrivateKeySigner).privateKey).toBe(privateKey);
  });
  
  test('should return null for unsupported serialized types', () => {
    const unsupportedSerialized = { type: 'unsupported' as any };
    const signer = deserializeSigner(unsupportedSerialized as any);
    
    expect(signer).toBeNull();
  });
  
  test('should handle errors during deserialization', () => {
    const invalidSerialized = { type: 'privateKey' as const, data: undefined };
    const signer = deserializeSigner(invalidSerialized);
    
    expect(signer).toBeNull();
  });
});