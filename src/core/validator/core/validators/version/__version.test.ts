import { describe, it } from 'vitest';
import { __TestUtils } from '../../../__testUtils.js';
import { version } from './version.js';

const { expect: _expect } = __TestUtils;
const fieldName = 'testVersion';

describe('version validator', () => {
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
        _expect.invalid(version(value, fieldName));
      });
    });
  });
  describe('empty validation', () => {
    it('should reject empty string', () => {
      _expect.invalid(version('', fieldName));
    });
  });

  describe('semver validation', () => {
    it('should accept valid semver versions', () => {
      const validVersions = [
        '1.0.0',
        '0.1.0',
        '1.2.3',
        '10.20.30',
        '1.1.2',
        '1.0.0-alpha',
        '1.0.0-alpha.1',
        '1.0.0-0.3.7',
        '1.0.0-x.7.z.92',
        '1.0.0-x-y-z.-',
        '1.11.1',
        '11.1.1',
        '1.1.11'
      ] as const;

      validVersions.forEach((value) => {
        _expect.valid(version(value, fieldName));
      });
    });

    it('should reject invalid semver versions', () => {
      const invalidVersions = [
        '1',
        '1.0',
        'v1.0.0',
        '1.0.0.0',
        '01.1.0',
        '1.01.0',
        '1.1.01',
        'not-a-version'
      ];

      invalidVersions.forEach((value) => {
        _expect.invalid(version(value, fieldName));
      });
    });
  });

  describe('combined validation', () => {
    it('should fail on first validation failure', () => {
      _expect.invalid(version(123, fieldName));
    });

    it('should pass all validations for valid version', () => {
      _expect.valid(version('1.0.0', fieldName));
    });
  });

  describe('Respects mustMatch parameter', () => {
    it('should pass when version matches mustMatch', () => {
      const mustMatch = '1.0.0';
      _expect.valid(version(mustMatch, fieldName, { mustMatch }));
    });
    it('should fail when version does not match mustMatch', () => {
      const mustMatch = '1.0.0';
      const invalidVersion = '2.0.0';
      const result = version(invalidVersion, fieldName, { mustMatch });
      _expect.invalid(result);
    });
  });
});
