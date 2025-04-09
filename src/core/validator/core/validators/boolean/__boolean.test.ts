import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../../validator/__testUtils';
import { boolean } from './boolean';

describe('boolean validator', () => {
  const { expect: _expect } = __TestUtils;

  describe('basic validation', () => {
    it('validates true as valid', () => {
      const result = boolean(true, 'isActive');
      _expect.valid(result);
      expect(result.value).toBe(true);
    });

    it('validates false as valid', () => {
      const result = boolean(false, 'isActive');
      _expect.valid(result);
      expect(result.value).toBe(false);
    });

    it('rejects non-boolean values', () => {
      const testCases = [
        'string',
        123,
        null,
        undefined,
        {},
        [],
        new Date(),
        NaN,
        Infinity
      ];

      testCases.forEach((value) => {
        const result = boolean(value, 'isActive');
        _expect.invalid(result);
        expect(result.value).toBe(null);
      });
    });
  });

  describe('with string conversion', () => {
    const options = { allowStringConversion: true };

    it('converts "true" to true', () => {
      const result = boolean('true', 'isActive', options);
      _expect.valid(result);
      expect(result.value).toBe(true);
    });

    it('converts "false" to false', () => {
      const result = boolean('false', 'isActive', options);
      _expect.valid(result);
      expect(result.value).toBe(false);
    });

    it('converts string variations with case insensitivity', () => {
      // All these should convert to true
      const trueVariations = ['TRUE', 'True', 'tRuE', ' true ', '\ttrue\n'];
      trueVariations.forEach((value) => {
        const result = boolean(value, 'isActive', options);
        _expect.valid(result);
        expect(result.value).toBe(true);
      });

      // All these should convert to false
      const falseVariations = [
        'FALSE',
        'False',
        'fAlSe',
        ' false ',
        '\tfalse\n'
      ];
      falseVariations.forEach((value) => {
        const result = boolean(value, 'isActive', options);
        _expect.valid(result);
        expect(result.value).toBe(false);
      });
    });

    it('rejects strings that are not "true" or "false"', () => {
      const invalidStrings = [
        'yes',
        'no',
        'on',
        'off',
        '1',
        '0',
        'truthy',
        'falsy',
        'truth',
        'falsehood'
      ];

      invalidStrings.forEach((value) => {
        const result = boolean(value, 'isActive', options);
        _expect.invalid(result);
        expect(result.value).toBe(null);
      });
    });

    it('rejects non-string non-boolean values even with string conversion enabled', () => {
      const testCases = [
        123,
        null,
        undefined,
        {},
        [],
        new Date(),
        NaN,
        Infinity
      ];

      testCases.forEach((value) => {
        const result = boolean(value, 'isActive', options);
        _expect.invalid(result);
        expect(result.value).toBe(null);
      });
    });

    it('respects mustBe argument', () => {
      expect(boolean(false, 'isActive', { mustBe: true }).value).toBe(null);
      expect(boolean(true, 'isActive', { mustBe: true }).value).toBe(true);
    });
  });

  describe('field naming in error messages', () => {
    it('includes field name in error messages', () => {
      const result = boolean(
        'not a boolean',
        'userSettings.notifications.emailEnabled'
      );
      _expect.invalid(result);
      expect(result.value).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('handles boolean objects correctly', () => {
      const booleanObject = new Boolean(true);
      const result = boolean(booleanObject, 'isActive');
      _expect.invalid(result);
      const pass = boolean(booleanObject, 'isActive', {
        allowBooleanObject: true
      });
      _expect.valid(pass);
    });

    it('handles empty strings with string conversion', () => {
      const result = boolean('', 'isActive', { allowStringConversion: true });
      _expect.invalid(result);
    });

    it('handles whitespace-only strings with string conversion', () => {
      const result = boolean('   ', 'isActive', {
        allowStringConversion: true
      });
      _expect.invalid(result);
    });
  });
});
