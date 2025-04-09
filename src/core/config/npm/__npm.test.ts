import { VERSIONS } from '#constants';
import { describe, expect, it } from 'vitest';
import { data, ops } from './npm.js';

describe('npm.types module', () => {
  describe('module metadata', () => {
    it('should have correct module name', () => {
      expect(data.moduleName).toBe('npm');
    });

    it('should have correct static properties', () => {
      expect(data.static).toEqual({ version: VERSIONS.base });
    });

    it('should have correct defaults', () => {
      expect(data.defaults).toEqual({
        url: '',
        contributors: [],
        keywords: []
      });
    });

    it('should define correct required keys', () => {
      expect(data.keys.requiredInput).toContain('name');
    });
  });

  describe('validator operations', () => {
    it('should successfully validate valid input', () => {
      const validInput = { name: 'my-package' };

      const result = ops.validate.inputConfig(validInput);
      expect(result.value).toEqual(validInput);
    });

    it('should reject invalid input missing required properties', () => {
      const invalidInput = {};

      const result = ops.validate.inputConfig(invalidInput);
      expect(result.value).toBe(null);
    });

    it('should validate name property correctly', () => {
      expect(ops.validate.prop.name('valid-name').value).toBe('valid-name');
    });

    it('should validate url property correctly', () => {
      expect(ops.validate.prop.url('https://example.com').value).toBe(
        'https://example.com'
      );
      expect(ops.validate.prop.url('').value).toBe(''); // allowEmpty: true
      expect(ops.validate.prop.url('invalid-but-still-a-string').value).toBe(
        'invalid-but-still-a-string'
      );
    });

    it('should validate keywords property correctly', () => {
      const { value } = ops.validate.prop.keywords(['tag1', 'tag2']);
      expect(value![0]).toBe('tag1');
      expect(value![1]).toBe('tag2');
      expect(ops.validate.prop.keywords(['tag1', 123]).value).toBe(null);
    });

    it('should validate contributors property correctly', () => {
      expect(
        ops.validate.prop.contributors([
          { name: 'John Doe', url: '', email: '' }
        ]).value
      ).toEqual([{ name: 'John Doe', url: '', email: '' }]);
      expect(ops.validate.prop.contributors([]).value).toEqual([]); // allowEmpty: true
      expect(ops.validate.prop.contributors([{ invalid: 'data' }]).value).toBe(
        null
      );
    });
  });

  describe('resolver operations', () => {
    it('should successfully resolve valid input with defaults', () => {
      const input = { name: 'my-package' };

      const result = ops.resolve.withValidation.unknownInput(input);

      if (result.value) {
        expect(result.value).toEqual({
          name: 'my-package',
          url: '',
          contributors: [],
          keywords: [],
          version: VERSIONS.base
        });
      }
    });

    it('should provide accurate merged result for typed input', () => {
      const input = {
        name: 'my-package',
        url: 'https://example.com',
        keywords: ['tag1']
      };

      const merged = ops.resolve.input(input).value;
      expect(merged).toEqual({
        name: 'my-package',
        url: 'https://example.com',
        contributors: [],
        keywords: ['tag1'],
        version: VERSIONS.base
      });
    });
    it('should validate contributors with various person configurations', () => {
      // Test with partial data
      expect(
        ops.validate.prop.contributors([{ name: 'Only Name' }]).value
      ).toEqual([{ name: 'Only Name' }]);

      // Test with email-only and url-only
      expect(
        ops.validate.prop.contributors([
          { name: 'Name', email: 'test@example.com' },
          { name: 'Name2', url: 'https://example.com' }
        ]).value
      ).toEqual([
        { name: 'Name', email: 'test@example.com' },
        { name: 'Name2', url: 'https://example.com' }
      ]);

      // Test with mixed valid and invalid entries
      const mixedResult = ops.validate.prop.contributors([
        { name: 'Valid' },
        { url: 'Url' }
      ]);
      expect(mixedResult.value).toMatchObject([
        { name: 'Valid' },
        { url: 'Url' }
      ]);
    });
  });
});
