import { describe, it } from 'vitest';
import { __TestUtils } from '../../../__testUtils.js';
import { license } from './license.js';

const { expect: _expect } = __TestUtils;
const fieldName = 'testLicense';

describe('license validator', () => {
  describe('object validation', () => {
    it('should reject non-object values', () => {
      const invalidValues = [
        'string',
        123,
        true,
        null,
        undefined,
        [],
        () => undefined,
        Symbol()
      ];

      invalidValues.forEach((value) => {
        _expect.invalid(license(value, fieldName));
      });
    });
  });

  describe('type validation', () => {
    it('should reject missing type property', () => {
      _expect.invalid(license({ url: 'https://example.com' }, fieldName));
    });

    it('should reject non-string type', () => {
      _expect.invalid(
        license({ type: 123, url: 'https://example.com' }, fieldName)
      );
    });

    it('should reject empty type string', () => {
      _expect.invalid(
        license({ type: '', url: 'https://example.com' }, fieldName)
      );
    });
  });

  describe('url validation', () => {
    it('should reject missing url property', () => {
      _expect.invalid(license({ type: 'MIT' }, fieldName));
    });

    it('should reject invalid url format', () => {
      _expect.invalid(license({ type: 'MIT', url: 'not-a-url' }, fieldName));
    });
  });

  describe('valid license', () => {
    it('should accept valid license object', () => {
      _expect.valid(
        license(
          { type: 'MIT', url: 'https://opensource.org/licenses/MIT' },
          fieldName
        )
      );
    });
  });
});
