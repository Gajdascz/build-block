import { describe, it } from 'vitest';
import { __TestUtils } from '../../../__testUtils.js';
import { url } from './url.js';

const { expect: _expect } = __TestUtils;

describe('url validator', () => {
  const fieldName = 'testUrl';

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
        _expect.invalid(url(value, fieldName));
      });
    });
  });

  describe('empty validation', () => {
    it('should reject empty string by default', () => {
      _expect.invalid(url('', fieldName));
    });

    it('should accept empty string when allowEmpty is true', () => {
      _expect.valid(url('', fieldName, { allowEmpty: true }));
    });
  });

  describe('url format validation', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        'http://example.com',
        'https://test.com/path',
        'https://sub.domain.com/path?query=1'
      ];

      validUrls.forEach((value) => {
        _expect.valid(url(value, fieldName));
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'http://localhost:3000',
        'not-a-url',
        'ftp://example.com',
        'example.com',
        'http:/missing-slash',
        'http:/',
        'https://'
      ];

      invalidUrls.forEach((value) => {
        _expect.invalid(url(value, fieldName));
      });
    });
  });

  describe('combined validation', () => {
    it('should validate all conditions together', () => {
      const result = url('https://example.com', fieldName, {
        allowEmpty: false
      });
      _expect.valid(result);
    });

    it('should fail on first validation failure', () => {
      const result = url(123, fieldName, { allowEmpty: true });
      _expect.invalid(result);
    });
  });
});
