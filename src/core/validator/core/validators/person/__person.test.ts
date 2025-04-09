import { describe, it } from 'vitest';
import { __TestUtils } from '../../../__testUtils.js';
import * as Person from './person.js';

const { expect: _expect } = __TestUtils;
const fieldName = 'testPerson';

describe('person validator', () => {
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
        _expect.invalid(Person.full(value, fieldName));
      });
    });

    it('should accept valid person objects', () => {
      const validPerson = {
        name: 'John Doe',
        email: 'example@email.com',
        url: 'https://example.com'
      };
      _expect.valid(Person.full(validPerson, fieldName));
    });
  });

  describe('name validation', () => {
    it('should reject non-string name', () => {
      const invalidNames = [
        123,
        true,
        null,
        undefined,
        [],
        {},
        () => undefined
      ];

      invalidNames.forEach((name) => {
        const result = Person.full({ name, email: '', url: '' }, fieldName, {
          allowEmpty: { email: true, url: true }
        });
        _expect.invalid(result);
      });
    });
  });

  describe('url validation', () => {
    it('should reject non-string url', () => {
      const invalidUrls = [123, true, null, [], {}, () => undefined];

      invalidUrls.forEach((url) => {
        const result = Person.full(
          { name: 'John Doe', url, email: '' },
          fieldName,
          { allowEmpty: { email: false } }
        );
        _expect.invalid(result);
      });
    });

    it('should accept valid url', () => {
      const validPerson = {
        name: 'John Doe',
        url: 'https://example.com',
        email: ''
      };
      _expect.valid(
        Person.full(validPerson, fieldName, { allowEmpty: { email: true } })
      );
    });
  });

  describe('combined validation', () => {
    it('should accept complete valid person', () => {
      const validPerson = {
        name: 'John Doe',
        url: 'https://example.com',
        email: 'john@example.com'
      };
      _expect.valid(Person.full(validPerson, fieldName));
    });
  });
});
