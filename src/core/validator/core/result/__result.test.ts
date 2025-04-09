import { describe, expect, it } from 'vitest';
import type { Result } from '../types/types.js';
import { invalid, joinMessages, partition, valid } from './result.js';

describe('result.ts', () => {
  describe('valid', () => {
    it('should create a valid result', () => {
      const value = 'test';
      const result = valid(value, 'test');
      expect(result.value).toEqual(value);
      expect(result.message).toContain('Passed');
    });

    it('should handle complex values', () => {
      const obj = { name: 'test', value: 42 };
      const result = valid(obj, 'TestObject');
      expect(result.value).toEqual(obj);
      expect(result.message).toContain('Passed');
    });
    it('should use custom message', () => {
      const value = 'test';
      const result = valid(value, 'Test', 'Custom message');
      expect(result.value).toEqual(value);
      expect(result.message).toContain('Custom message');
    });
  });
  describe('invalid', () => {
    it('should create an invalid result with default error description', () => {
      const received = 'bad value';
      const fieldName = 'TestField';
      const result = invalid(received, fieldName);
      expect(result.value).toEqual(null);
      expect(result.message).toContain(fieldName);
      expect(result.message).toContain(received);
    });

    it('should create an invalid result with custom error description', () => {
      const received = 42;
      const fieldName = 'Number';
      const errorDesc = 'Expected string';
      const result = invalid(received, fieldName, errorDesc);
      expect(result.value).toEqual(null);
      expect(result.message).toContain(fieldName);
      expect(result.message).toContain(errorDesc);
      expect(result.message).toContain(String(received));
    });

    it('should handle objects as received values', () => {
      const received = { id: 123 };
      const fieldName = 'Object';
      const result = invalid(received, fieldName);
      expect(result.value).toEqual(null);
      expect(result.message).toContain('Object');
    });
  });
  describe('partition', () => {
    it('should partition results into valid and invalid', () => {
      const results: Result<unknown>[] = [
        valid('test', 'Test 1'),
        invalid(42, 'Test 2'),
        valid('test', 'Test 3'),
        invalid(42, 'Test 4')
      ];

      const { valid: validResults, invalid: invalidResults } =
        partition(results);

      expect(validResults).toEqual([results[0], results[2]]);
      expect(invalidResults).toEqual([results[1], results[3]]);
    });
    it('should handle empty results', () => {
      const results: Result<unknown>[] = [];

      const { valid: validResults, invalid: invalidResults } =
        partition(results);

      expect(validResults).toEqual([]);
      expect(invalidResults).toEqual([]);
    });
  });
  describe('joinMessages', () => {
    it('should join result messages into a single string', () => {
      const results: Result<unknown>[] = [
        valid('test1', 'Field1'),
        valid('test2', 'Field2'),
        invalid('bad', 'Field3', 'Invalid value')
      ];

      const joined = joinMessages(results);

      // Should contain all messages joined by newlines
      expect(joined).toContain('Field1');
      expect(joined).toContain('Field2');
      expect(joined).toContain('Field3');
      expect(joined).toContain('Invalid value');
    });

    it('should handle empty results array', () => {
      const results: Result<unknown>[] = [];

      const joined = joinMessages(results);

      expect(joined).toBe('');
    });

    it('should handle results with empty messages', () => {
      const results: Result<unknown>[] = [
        { value: 'test', message: '' },
        { value: null, message: 'Error message' }
      ];

      const joined = joinMessages(results);

      expect(joined).toBe('Error message');
    });

    it('should trim whitespace from the final result', () => {
      const results: Result<unknown>[] = [
        { value: 'test1', message: '  Message with spaces  ' },
        { value: 'test2', message: '\nMessage with newlines\n' }
      ];

      const joined = joinMessages(results);
      console.log(joined);
      // Should not have leading or trailing whitespace
      expect(joined).not.toMatch(/^\s+|\s+$/);
      expect(joined).toBe('Message with spaces\nMessage with newlines');
    });
  });
});
