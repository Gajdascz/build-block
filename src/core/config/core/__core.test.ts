import { LICENSE, VERSIONS } from '#constants';
import { describe, expect, it } from 'vitest';
import { path, utils } from '../../../../__mocks__/index.js';
import { __TestUtils } from '../../validator/__testUtils.js';
import * as Base from './core.js';
describe('Core Types Module', () => {
  const { expect: _expect } = __TestUtils;
  const { validate, resolve } = Base.ops;

  describe('Validation', () => {
    it('should validate correct inputs', () => {
      const validInput = {
        namespace: 'test-namespace',
        slug: 'test-slug',
        title: 'Test Title',
        description: 'A test description',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorUrl: 'https://example.com',
        repository: 'https://github.com/user/repo',
        funding: 'https://sponsor.me/project'
      };

      const result = validate.inputConfig(validInput);
      _expect.valid(result);
    });

    it('should reject invalid inputs', () => {
      const invalidInput = {
        // Missing required fields
        description: 'Missing required fields'
      };

      const result = validate.inputConfig(invalidInput);
      _expect.invalid(result);
    });

    it('should validate individual properties', () => {
      _expect.valid(validate.prop.title('Valid Title'));
      _expect.invalid(validate.prop.title(''));

      _expect.valid(validate.prop.slug('valid-slug'));
      _expect.invalid(validate.prop.slug(''));

      _expect.valid(validate.prop.namespace('valid-namespace'));
      _expect.invalid(validate.prop.namespace(''));
    });
  });

  describe('Resolution', () => {
    it('should resolve minimal input to a complete config', () => {
      const minimalInput = {
        namespace: 'test-namespace',
        slug: 'test-slug',
        title: 'Test Title',
        description: 'A test description'
      };

      const resolved = resolve.input(minimalInput).value!;

      // Test that it has all the required properties
      expect(resolved.namespace).toBe('test-namespace');
      expect(resolved.slug).toBe('test-slug');
      expect(resolved.title).toBe('Test Title');

      // Test that static values are included
      expect(resolved.version).toBe(VERSIONS.base);
      expect(resolved.license).toBe(LICENSE);

      // Test that optional values get defaults
      expect(resolved.authorEmail).toBeDefined();
      expect(resolved.authorUrl).toBeDefined();
      expect(resolved.authorName).toBeDefined();
      expect(resolved.description).toBe('A test description');
      expect(resolved.repository).toBe('');
      expect(resolved.funding).toBe('');
    });
  });

  describe('Validation with Resolution', () => {
    it('should validate and resolve unknown input', () => {
      const input = {
        namespace: 'test-namespace',
        slug: 'test-slug',
        title: 'Test Title'
      };

      const result = resolve.withValidation.unknownInput(input);
      _expect.valid(result);

      if (result.value) {
        expect(result.value.namespace).toBe('test-namespace');
        expect(result.value.version).toBe(VERSIONS.base);
        expect(result.value.license).toBe(LICENSE);
      }
    });

    it('should validate and resolve typed input', () => {
      const input = {
        namespace: 'test-namespace',
        slug: 'test-slug',
        title: 'Test Title',
        description: 'A test description'
      };

      const result = resolve.withValidation.typedInput(input);
      _expect.valid(result);

      if (result.value) {
        expect(result.value.namespace).toBe('test-namespace');
        expect(result.value.version).toBe(VERSIONS.base);
        expect(validate.prop.description(result.value.description).value).toBe(
          input.description
        );
      }
    });
  });
  describe('Input Resolver Helper', () => {
    it('should enforce slug as final directory name', () => {
      try {
        // Case 1: outputDirectory does not have slug as basename
        const case1 = {
          namespace: 'test-namespace',
          title: 'Test Title',
          description: 'A test description',
          slug: 'test-slug',
          outputDirectory: '/some/path'
        };
        const result1 = resolve.input(case1).value!;
        expect(result1.outputDirectory).toBe('/resolved/some/path/test-slug');
        expect(result1.namespace).toBe('test-namespace');
        expect(result1.slug).toBe('test-slug');

        // Case 2: outputDirectory already has slug as basename
        const case2 = {
          namespace: 'test-namespace',
          slug: 'test-slug',
          title: 'Test Title',
          description: 'A test description',
          outputDirectory: '/some/path/test-slug'
        };
        const result2 = resolve.input(case2).value!;
        expect(result2.outputDirectory).toBe('/resolved/some/path/test-slug');

        // Case 3: outputDirectory has trailing slash
        const case3 = {
          namespace: 'test-namespace',
          slug: 'test-slug',
          title: 'Test Title',
          description: 'A test description',
          outputDirectory: '/some/path/'
        };
        const result3 = resolve.input(case3).value!;
        expect(result3.outputDirectory).toBe('/resolved/some/path/test-slug');

        // Case 4: slug needs slugification
        const case4 = {
          namespace: 'Test Namespace',
          slug: 'Test Slug',
          title: 'Test Title',
          description: 'A test description',
          outputDirectory: '/some/path'
        };
        const result4 = resolve.input(case4).value!;
        expect(result4.outputDirectory).toBe('/resolved/some/path/test-slug');
        expect(result4.namespace).toBe('test-namespace');
        expect(result4.slug).toBe('test-slug');

        // Case 5: No outputDirectory provided (uses process.cwd() as default)
        const case5 = {
          namespace: 'test-namespace',
          slug: 'test-slug',
          title: 'Test Title',
          description: 'Test description'
        };
        const result5 = resolve.input(case5).value!;
        expect(result5.outputDirectory).toContain('test-slug');

        // Case 6: Outdir does not end with slug and has trailing slash
        const case6 = {
          namespace: 'test-namespace',
          slug: 'test-slug',
          title: 'Test Title',
          description: 'Test description',
          outputDirectory: 'some/path/not-correct/'
        };
        const result6 = resolve.input(case5).value!;
        expect(result6.outputDirectory).toContain('test-slug');
      } catch (e) {
        console.log(`Unexpected error: ${e}`);
        expect(true).toBe(false);
      }
    });
  });
});
