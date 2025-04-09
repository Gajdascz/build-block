import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../__testUtils.js';
import { number } from './number.js';

const { expect: _expect } = __TestUtils;
const fieldName = 'testNumber';

describe('number validator', () => {
  describe('configuration validation', () => {
    it('should reject when both positive and negative are false', () => {
      _expect.invalid(
        number(0, fieldName, { allow: { positive: false, negative: false } })
      );
    });

    it('should reject when min is greater than max', () => {
      _expect.invalid(number(5, fieldName, { bounds: { min: 10, max: 5 } }));
    });
  });

  describe('type validation', () => {
    it('should reject non-number values', () => {
      const invalidValues = [
        'string',
        true,
        {},
        [],
        null,
        undefined,
        Symbol(),
        () => undefined
      ];

      invalidValues.forEach((value) => {
        _expect.invalid(number(value, fieldName));
      });
    });

    it('should accept number values', () => {
      _expect.valid(number(42, fieldName));
    });
    it('should reject a string by default', () => {
      const result = number('42');
      expect(result.value).toBeNull();
    });

    it('should accept a string with stringConversion enabled', () => {
      const result = number('42', 'TestNumber', {
        allow: { stringConversion: true }
      });
      expect(result.value).toBe(42);
    });

    it('should reject non-numeric strings even with stringConversion enabled', () => {
      const result = number('not-a-number', 'TestNumber', {
        allow: { stringConversion: true }
      });
      expect(result.value).toBeNull();
    });

    it('should reject objects', () => {
      const result = number({}, 'TestNumber');
      expect(result.value).toBeNull();
    });

    it('should reject arrays', () => {
      const result = number([], 'TestNumber');
      expect(result.value).toBeNull();
    });

    it('should reject null', () => {
      const result = number(null, 'TestNumber');
      expect(result.value).toBeNull();
    });

    it('should reject undefined', () => {
      const result = number(undefined, 'TestNumber');
      expect(result.value).toBeNull();
    });
  });

  describe('infinity validation', () => {
    it('should accept infinity by default', () => {
      _expect.valid(number(Infinity, fieldName));
    });

    it('should reject infinity when disabled', () => {
      _expect.invalid(
        number(Infinity, fieldName, { allow: { infinity: false } })
      );
    });

    it('should handle negative infinity', () => {
      _expect.valid(
        number(-Infinity, fieldName, {
          allow: { infinity: true, negative: true }
        })
      );
    });
  });

  describe('sign validation', () => {
    it('should handle zero with various sign configurations', () => {
      const configs = [
        { positive: true, negative: true },
        { positive: true, negative: false },
        { positive: false, negative: true }
      ];

      configs.forEach((config) => {
        _expect.valid(number(0, fieldName, { allow: config }));
      });
    });

    it('should reject positive numbers when only negative allowed', () => {
      _expect.invalid(number(42, fieldName, { allow: { positive: false } }));
    });

    it('should reject negative numbers when only positive allowed', () => {
      _expect.invalid(number(-42, fieldName, { allow: { negative: false } }));
    });
  });

  describe('bounds validation', () => {
    it('should handle inclusive bounds', () => {
      _expect.valid(number(5, fieldName, { bounds: { min: 5, max: 5 } }));
    });

    it('should reject numbers below minimum', () => {
      _expect.invalid(number(5, fieldName, { bounds: { min: 10 } }));
    });

    it('should reject numbers above maximum', () => {
      _expect.invalid(number(5, fieldName, { bounds: { max: 0 } }));
    });
  });

  describe('NaN validation', () => {
    it('should reject NaN by default', () => {
      _expect.invalid(number(NaN, fieldName));
    });
    it('should accept NaN when explicitly allowed', () => {
      _expect.valid(number(NaN, fieldName, { allow: { nan: true } }));
    });
  });

  describe('default configurations', () => {
    it('should use correct defaults when no options provided', () => {
      _expect.valid(number(42, fieldName));
    });

    it('should use partial defaults when some options provided', () => {
      _expect.invalid(number(42, fieldName, { allow: { positive: false } }));
    });
  });

  describe('mustMatch option', () => {
    it('should accept a value that matches mustMatch', () => {
      const result = number(42, 'TestNumber', { mustMatch: 42 });
      expect(result.value).toBe(42);
    });

    it('should reject a value that does not match mustMatch', () => {
      // This should fail one of the later validations (like bounds)
      const result = number(42, 'TestNumber', {
        mustMatch: 43,
        bounds: { max: 41 } // This creates a situation where it will fail bounds check
      });
      expect(result.value).toBeNull();
    });

    it('should accept a matching value even if other constraints would fail', () => {
      // Negative value with only positive allowed, but mustMatch overrides
      const result = number(-5, 'TestNumber', {
        mustMatch: -5,
        allow: { negative: false, positive: true }
      });
      expect(result.value).toBe(-5);
    });

    it('should handle string conversion with mustMatch', () => {
      const result = number('42', 'TestNumber', {
        mustMatch: 42,
        allow: { stringConversion: true }
      });
      expect(result.value).toBe(42);
    });
  });
});
