import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { logger } from '../../lib/logger';

describe('Logger', () => {
  // Save original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  
  // Mock console methods
  beforeEach(() => {
    console.log = mock.fn();
    console.info = mock.fn();
    console.warn = mock.fn();
    console.error = mock.fn();
    console.debug = mock.fn();
  });
  
  // Restore original console methods
  afterEach(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  });
  
  test('should have all log level methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
  
  test('should log messages with info level', () => {
    logger.info('Test info message');
    
    expect(console.info).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('INFO'),
      expect.stringContaining('Test info message')
    );
  });
  
  test('should log messages with warn level', () => {
    logger.warn('Test warning message');
    
    expect(console.warn).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('WARN'),
      expect.stringContaining('Test warning message')
    );
  });
  
  test('should log messages with error level', () => {
    logger.error('Test error message');
    
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR'),
      expect.stringContaining('Test error message')
    );
  });
  
  test('should log messages with debug level', () => {
    logger.debug('Test debug message');
    
    expect(console.debug).toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('DEBUG'),
      expect.stringContaining('Test debug message')
    );
  });
  
  test('should include timestamp in log messages', () => {
    logger.info('Test message with timestamp');
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      expect.any(String)
    );
  });
  
  test('should log objects and format them', () => {
    const testObject = { name: 'Test', value: 123 };
    
    logger.info('Test object', testObject);
    
    expect(console.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Test object'),
      expect.any(String) // The formatted object
    );
  });
  
  test('should log errors with stack traces', () => {
    const testError = new Error('Test error');
    
    logger.error('Error occurred', testError);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Error occurred'),
      expect.stringContaining('Test error'),
      expect.stringContaining('stack')
    );
  });
  
  test('should support context objects', () => {
    const context = { requestId: '123', user: 'test-user' };
    
    logger.info('Test with context', { context });
    
    expect(console.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Test with context'),
      expect.stringContaining('requestId'),
      expect.stringContaining('user')
    );
  });
  
  test('should respect log level configuration', () => {
    // Save original log level
    const originalLevel = logger.level;
    
    try {
      // Set log level to INFO
      logger.level = 'info';
      
      // Debug messages should not be logged
      logger.debug('This should not be logged');
      expect(console.debug).not.toHaveBeenCalled();
      
      // Info messages should be logged
      logger.info('This should be logged');
      expect(console.info).toHaveBeenCalled();
      
      // Set log level to ERROR
      logger.level = 'error';
      
      // Info messages should not be logged
      (console.info as any).mockClear();
      logger.info('This should not be logged');
      expect(console.info).not.toHaveBeenCalled();
      
      // Warn messages should not be logged
      logger.warn('This should not be logged');
      expect(console.warn).not.toHaveBeenCalled();
      
      // Error messages should be logged
      logger.error('This should be logged');
      expect(console.error).toHaveBeenCalled();
    } finally {
      // Restore original log level
      logger.level = originalLevel;
    }
  });
  
  test('should support custom formatters', () => {
    // Save original formatter
    const originalFormatter = logger.formatter;
    
    try {
      // Set custom formatter
      logger.formatter = (level: string, message: string, ...args: any[]) => {
        return [`CUSTOM-${level}`, `[${message}]`, ...args];
      };
      
      logger.info('Custom formatted message');
      
      expect(console.info).toHaveBeenCalledWith(
        'CUSTOM-INFO',
        '[Custom formatted message]'
      );
    } finally {
      // Restore original formatter
      logger.formatter = originalFormatter;
    }
  });
});