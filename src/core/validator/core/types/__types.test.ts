import { describe, expect, it } from 'vitest';
import { is, REGEX } from './types.js';

describe('types.ts', () => {
  describe('REGEX', () => {
    describe('url', () => {
      it('should match valid URLs', () => {
        const validUrls = [
          'http://example.com',
          'https://example.com',
          'http://www.example.com',
          'https://subdomain.example.com',
          'http://example.com/path',
          'https://example.com/path?query=1',
          'http://example.com:8080'
        ];

        validUrls.forEach((url) => {
          expect(REGEX.url.test(url)).toBe(true);
        });
      });

      it('should not match invalid URLs', () => {
        const invalidUrls = [
          'example.com',
          'ftp://example.com',
          'http:/example.com',
          'http//example.com',
          'http://',
          '',
          'http:// spaceinurl.com'
        ];

        invalidUrls.forEach((url) => {
          expect(REGEX.url.test(url)).toBe(false);
        });
      });
    });

    describe('semVer', () => {
      it('should match valid semantic versions', () => {
        const validVersions = [
          '0.1.0',
          '1.0.0',
          '1.0.0-alpha',
          '1.0.0-alpha.1',
          '1.0.0-beta+exp.sha.5114f85',
          '1.0.0+20130313144700'
        ];

        validVersions.forEach((version) => {
          expect(REGEX.semVer.test(version)).toBe(true);
        });
      });

      it('should not match invalid semantic versions', () => {
        const invalidVersions = [
          '01.0.0',
          '1.01.0',
          '1.0.01',
          '1.0',
          '1',
          'v1.0.0',
          '1.0.0.0',
          '',
          'not a version'
        ];

        invalidVersions.forEach((version) => {
          expect(REGEX.semVer.test(version)).toBe(false);
        });
      });
    });
  });
  describe('is', () => {
    describe('url', () => {
      it('should validate URLs correctly', () => {
        expect(is.url('http://example.com')).toBe(true);
        expect(is.url('https://example.com/path')).toBe(true);
        expect(is.url('not a url')).toBe(false);
        expect(is.url('')).toBe(false);
        expect(is.url(null)).toBe(false);
        expect(is.url(undefined)).toBe(false);
        expect(is.url(123)).toBe(false);
      });
    });
    describe('version', () => {
      it('should validate semantic versions correctly', () => {
        expect(is.version('1.0.0')).toBe(true);
        expect(is.version('1.0.0-alpha')).toBe(true);
        expect(is.version('1.0')).toBe(false);
        expect(is.version('v1.0.0')).toBe(false);
        expect(is.version('')).toBe(false);
        expect(is.version(null)).toBe(false);
        expect(is.version(undefined)).toBe(false);
        expect(is.version(123)).toBe(false);
      });
    });
    describe('primitiveType', () => {
      it('should validate primitive types correctly', () => {
        expect(is.primitive.type('string')).toBe(true);
        expect(is.primitive.type('number')).toBe(true);
        expect(is.primitive.type('boolean')).toBe(true);
        expect(is.primitive.type('function')).toBe(true);
        expect(is.primitive.type('symbol')).toBe(true);
        expect(is.primitive.type('bigint')).toBe(true);
        expect(is.primitive.type('object')).toBe(false);
        expect(is.primitive.type('not-a-type')).toBe(false);
        expect(is.primitive.type(null)).toBe(false);
        expect(is.primitive.type(123)).toBe(false);
      });
    });
    describe('bounds', () => {
      it('should validate bounds objects correctly', () => {
        expect(is.bounds({ min: 0, max: 10 })).toBe(true);
        expect(is.bounds({ min: -5, max: 5 })).toBe(true);
        expect(is.bounds({ min: 'a', max: 10 })).toBe(false);
        expect(is.bounds({ min: 0, max: '10' })).toBe(false);
        expect(is.bounds({ min: 0 })).toBe(false);
        expect(is.bounds({ max: 10 })).toBe(false);
        expect(is.bounds({})).toBe(false);
        expect(is.bounds(null)).toBe(false);
        expect(is.bounds('not bounds')).toBe(false);
      });
    });
    describe('result', () => {
      it('should validate result objects correctly', () => {
        expect(is.result({ value: 'test', message: '' })).toBe(true);
        expect(is.result({ value: null, message: 'Error' })).toBe(true);
        expect(is.result({ value: 123, message: 'Test' })).toBe(true);
        expect(is.result({ value: 'test' })).toBe(false);
        expect(is.result({ message: 'Error' })).toBe(true); // This passes as undefined is allowed for value
        expect(is.result({})).toBe(false);
        expect(is.result(null)).toBe(false);
        expect(is.result('not a result')).toBe(false);
      });
    });
    describe('primitive', () => {
      describe('string', () => {
        it('should validate strings correctly', () => {
          expect(is.primitive.string('test')).toBe(true);
          expect(is.primitive.string('')).toBe(true);
          expect(is.primitive.string(123)).toBe(false);
          expect(is.primitive.string(null)).toBe(false);
          expect(is.primitive.string(undefined)).toBe(false);
          expect(is.primitive.string({})).toBe(false);
        });
      });

      describe('number', () => {
        it('should validate numbers correctly', () => {
          expect(is.primitive.number(123)).toBe(true);
          expect(is.primitive.number(0)).toBe(true);
          expect(is.primitive.number(-1)).toBe(true);
          expect(is.primitive.number(NaN)).toBe(true);
          expect(is.primitive.number('123')).toBe(false);
          expect(is.primitive.number(null)).toBe(false);
          expect(is.primitive.number(undefined)).toBe(false);
        });
      });

      describe('bigint', () => {
        it('should validate bigints correctly', () => {
          expect(is.primitive.bigint(BigInt(123))).toBe(true);
          expect(is.primitive.bigint(123n)).toBe(true);
          expect(is.primitive.bigint(123)).toBe(false);
          expect(is.primitive.bigint('123')).toBe(false);
          expect(is.primitive.bigint(null)).toBe(false);
        });
      });

      describe('boolean', () => {
        it('should validate booleans correctly', () => {
          expect(is.primitive.boolean(true)).toBe(true);
          expect(is.primitive.boolean(false)).toBe(true);
          expect(is.primitive.boolean(1)).toBe(false);
          expect(is.primitive.boolean(0)).toBe(false);
          expect(is.primitive.boolean('true')).toBe(false);
          expect(is.primitive.boolean(null)).toBe(false);
        });
      });

      describe('symbol', () => {
        it('should validate symbols correctly', () => {
          expect(is.primitive.symbol(Symbol('test'))).toBe(true);
          expect(is.primitive.symbol(Symbol())).toBe(true);
          expect(is.primitive.symbol('symbol')).toBe(false);
          expect(is.primitive.symbol(null)).toBe(false);
          expect(is.primitive.symbol({})).toBe(false);
        });
      });

      describe('function', () => {
        it('should validate functions correctly', () => {
          expect(is.primitive.function(() => undefined)).toBe(true);
          expect(
            is.primitive.function(function () {
              return undefined;
            })
          ).toBe(true);
          expect(is.primitive.function(console.log)).toBe(true);
          expect(is.primitive.function({})).toBe(false);
          expect(is.primitive.function('function')).toBe(false);
          expect(is.primitive.function(null)).toBe(false);
        });
      });
    });
    describe('empty', () => {
      describe('string', () => {
        it('should validate empty strings correctly', () => {
          expect(is.empty.string('')).toBe(true);
          expect(is.empty.string('test')).toBe(false);
          expect(is.empty.string(null)).toBe(false);
          expect(is.empty.string(undefined)).toBe(false);
          expect(is.empty.string(123)).toBe(false);
          expect(is.empty.string({})).toBe(false);
        });
      });
      describe('array', () => {
        it('should validate empty arrays correctly', () => {
          expect(is.empty.array([])).toBe(true);
          expect(is.empty.array([1, 2, 3])).toBe(false);
          expect(is.empty.array(null)).toBe(false);
          expect(is.empty.array(undefined)).toBe(false);
          expect(is.empty.array(123)).toBe(false);
          expect(is.empty.array({})).toBe(false);
        });
      });
    });
    describe('person', () => {
      it('should validate a person with just a name', () => {
        const person = { name: 'John Doe', url: '', email: '' };
        expect(is.person(person)).toBe(true);
      });

      it('should validate a person with name and url', () => {
        const person = {
          name: 'John Doe',
          url: 'https://example.com',
          email: ''
        };
        expect(is.person(person)).toBe(true);
      });

      it('should validate a person with name and email', () => {
        const person = { name: 'John Doe', email: 'john@example.com', url: '' };
        expect(is.person(person)).toBe(true);
      });

      it('should validate a person with name, url and email', () => {
        const person = {
          name: 'John Doe',
          url: 'https://example.com',
          email: 'john@example.com'
        };
        expect(is.person(person)).toBe(true);
      });

      it('should reject an empty object', () => {
        expect(is.person({})).toBe(false);
      });

      it('should reject null', () => {
        expect(is.person(null)).toBe(false);
      });

      it('should reject undefined', () => {
        expect(is.person(undefined)).toBe(false);
      });

      it('should reject a primitive value', () => {
        expect(is.person('John Doe')).toBe(false);
        expect(is.person(123)).toBe(false);
      });

      it('should reject an object without a name property', () => {
        const person = { url: 'https://example.com', email: '' };
        expect(is.person(person)).toBe(false);
      });

      it('should reject an object with an empty name', () => {
        const person = { name: '' };
        expect(is.person(person)).toBe(false);
      });

      it('should reject an object with a non-string name', () => {
        const person = { name: 123 };
        expect(is.person(person)).toBe(false);
      });

      it('should reject an object with a non-string url', () => {
        const person = { name: 'John Doe', url: 123 };
        expect(is.person(person)).toBe(false);
      });
    });
  });
});
