import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../__testUtils.js';
import { string } from './string.js';

const { expect: _expect } = __TestUtils;
const fieldName = 'testField';

describe('string validator', () => {
  describe('type validation', () => {
    it('should reject non-string values', () => {
      const invalidValues = [
        123,
        true,
        {},
        [],
        null,
        undefined,
        Symbol(),
        () => undefined
      ];

      invalidValues.forEach((value) => {
        _expect.invalid(string(value, fieldName));
      });
    });

    it('should accept string values', () => {
      _expect.valid(string('test', fieldName));
    });
  });

  describe('empty string validation', () => {
    it('should reject empty string by default', () => {
      _expect.invalid(string('', fieldName));
    });

    it('should accept empty string when allowEmpty is true', () => {
      _expect.valid(string('', fieldName, { allowEmpty: true }));
    });
  });

  describe('bounds validation', () => {
    it('should reject strings shorter than minimum length', () => {
      _expect.invalid(string('a', fieldName, { bounds: { min: 2 } }));
    });

    it('should reject strings longer than maximum length', () => {
      _expect.invalid(string('test', fieldName, { bounds: { max: 3 } }));
    });

    it('should accept strings within bounds', () => {
      _expect.valid(string('test', fieldName, { bounds: { min: 2, max: 5 } }));
    });

    it('should handle inclusive bounds', () => {
      _expect.valid(string('test', fieldName, { bounds: { min: 4, max: 4 } }));
    });
  });

  describe('default options', () => {
    it('should use default bounds when not provided', () => {
      _expect.valid(string('test', fieldName));
    });

    it('should use partial bounds when provided', () => {
      _expect.valid(string('test', fieldName, { bounds: { min: 2 } }));
    });

    it('should use default allowEmpty when not provided', () => {
      _expect.invalid(string('', fieldName));
    });
  });

  describe('combined validation', () => {
    it('should validate all conditions together', () => {
      const result = string('test', fieldName, {
        allowEmpty: false,
        bounds: { min: 2, max: 5 }
      });
      _expect.valid(result);
    });

    it('should fail on first validation failure', () => {
      const result = string(123, fieldName, {
        allowEmpty: true,
        bounds: { min: 2, max: 5 }
      });
      _expect.invalid(result);
    });
  });
  it('respects shouldPass function', () => {
    const result = string('test', fieldName, {
      shouldPass: (value: unknown) => value === 'test'
    });
    _expect.valid(result);
    const result2 = string('not-test', fieldName, {
      shouldPass: (value: unknown) => value === 'test'
    });
    _expect.invalid(result2);
    const result3 = string('test', fieldName, {
      shouldPass: (value: unknown) => value !== 'test'
    });
    _expect.invalid(result3);
    const result4 = string('not-test', fieldName, {
      shouldPass: (value: unknown) => value !== 'test'
    });
    _expect.valid(result4);
  });
  it('respects regex pattern', () => {
    _expect.valid(string('test', fieldName, { pattern: /test/ }));
    _expect.invalid(string('test', fieldName, { pattern: /invalid/ }));
  });
});
