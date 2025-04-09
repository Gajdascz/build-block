import { describe, expect, it, vi } from 'vitest';
import { Builder, is, modules, normalize, resolveInput } from './composite';

const defaultCore = {
  namespace: 'test-ns',
  slug: 'test-slug',
  title: 'Test Title',
  description: 'A test description'
};

describe('Config Composite API', () => {
  describe('Type Guards', () => {
    it('should correctly identify RecommendedMinimumInput type', () => {
      expect(
        is.recommendedMinimumInput({
          namespace: 'test',
          slug: 'test',
          title: 'Test',
          blockCategory: 'widgets'
        })
      ).toBe(true);
      expect(
        is.recommendedMinimumInput({
          core: { namespace: 'test', slug: 'test', title: 'Test' }
        })
      ).toBe(false);
      expect(is.recommendedMinimumInput({})).toBe(false);
    });
    it('should identify full input', () => {
      expect(
        is.input({
          core: { namespace: 'test', slug: 'test', title: 'Test' },
          block: { category: 'widgets' },
          php: {},
          wp: {},
          npm: {}
        })
      ).toBe(true);
      expect(is.input({ core: defaultCore })).toBe(false);
    });
  });
  describe('normalize', () => {
    it('should handle normalize.unknown with various input types', () => {
      // Required Minimum
      expect(normalize.unknown(defaultCore)).toHaveProperty(
        'core.namespace',
        'test-ns'
      );
      // Recommended Minimum
      const recInput = { ...defaultCore, blockCategory: 'widgets' };
      expect(normalize.unknown(recInput)).toHaveProperty(
        'block.category',
        'widgets'
      );

      // has required
      const hasInput = { core: { ...defaultCore } };
      expect(normalize.unknown(hasInput)).toHaveProperty(
        'core.namespace',
        'test-ns'
      );
      // Full
      const structInput = {
        core: defaultCore,
        block: { category: 'custom' },
        php: {},
        wp: {},
        npm: {}
      };
      expect(normalize.unknown(structInput)).toEqual(structInput);
      expect(() => normalize.unknown(null)).toThrowError();
      expect(() => normalize.unknown(42)).toThrowError();
    });
    it('should conditionally add flattened properties when given recommendedMinimumInput', () => {
      const result = normalize.recommendedMinimumInput({
        ...defaultCore,
        blockCategory: 'widgets',
        npmPackageName: 'npm-package',
        npmPackageUrl: 'npm-package-url',
        description: 'A test description'
      });
      expect(result).toHaveProperty('npm.name', 'npm-package');
      expect(result).toHaveProperty('npm.url', 'npm-package-url');
      expect(result).toHaveProperty('block.category', 'widgets');
    });
  });
  describe('Input Resolution', () => {
    describe('full', () => {
      it('should correctly transform RequiredMinimumInput to full Resolved config', () => {
        const result = resolveInput.full(
          normalize.requiredMinimumInput(defaultCore)
        );
        expect(result).toHaveProperty('core.namespace', defaultCore.namespace);
        expect(result.block.category).toBe('widgets');
      });

      it('should correctly transform RecommendedMinimumInput to full Resolved config', () => {
        const result = resolveInput.full(
          normalize.recommendedMinimumInput({
            ...defaultCore,
            blockCategory: 'widgets'
          })
        );
        expect(result.block.category).toBe('widgets');
      });
      it('should correctly handle expanded Input with all sections', () => {
        const fullInput = {
          core: { ...defaultCore },
          block: { category: 'custom' },
          php: { classScope: 'CustomClass' },
          wp: {},
          npm: { name: 'custom-name' }
        };
        const result = resolveInput.full(fullInput);
        expect(result.php.classScope).toBe('CustomClass');
        expect(result.npm.name).toBe('custom-name');
      });
      it('should throw an error when core resolution fails', () => {
        const spy = vi.spyOn(resolveInput, 'module');
        spy.mockImplementation((module) => {
          if (module === 'core') {
            throw new Error('Core resolution failed');
          }
          return {} as any;
        });

        try {
          expect(() =>
            resolveInput.full({
              core: { ...defaultCore },
              block: {},
              php: {},
              wp: {},
              npm: {}
            })
          ).toThrowError();
        } finally {
          spy.mockRestore();
        }
      });
    });
    describe('module', () => {
      describe('resolveInput.module', () => {
        it('should successfully resolve valid module input', () => {
          const validCoreInput = {
            namespace: 'test-namespace',
            slug: 'test-slug',
            title: 'Test Title',
            description: 'A test description'
          };

          const result = resolveInput.module('core', validCoreInput);

          expect(result).toHaveProperty('namespace', 'test-namespace');
          expect(result).toHaveProperty('slug', 'test-slug');
          expect(result).toHaveProperty('title', 'Test Title');
          expect(result).toHaveProperty('version');
          expect(result).toHaveProperty('license');
        });

        it('should throw error for invalid module input', () => {
          const invalidCoreInput = {
            // Missing required properties
            namespace: 't' // Too short
          };

          expect(() =>
            //@ts-expect-error - Testing invalid behavior
            resolveInput.module('core', invalidCoreInput)
          ).toThrowError();
        });

        it('should handle errors from the validation process', () => {
          // Mock the validation function to throw an error
          const originalValidate =
            modules.core.ops.resolve.withValidation.unknownInput;
          modules.core.ops.resolve.withValidation.unknownInput = vi
            .fn()
            .mockImplementation(() => {
              throw new Error('Validation failed');
            });

          try {
            //@ts-expect-error - Testing invalid behavior
            expect(() => resolveInput.module('core', {})).toThrowError(
              /Configuration Error/
            );
          } finally {
            // Restore original function
            modules.core.ops.resolve.withValidation.unknownInput =
              originalValidate;
          }
        });

        it('should handle null result from validation', () => {
          // Mock the validation function to return null result
          const originalValidate =
            modules.core.ops.resolve.withValidation.unknownInput;
          modules.core.ops.resolve.withValidation.unknownInput = vi
            .fn()
            .mockReturnValue({
              value: null,
              message: 'Invalid input properties'
            });

          try {
            //@ts-expect-error - Testing invalid behavior
            expect(() => resolveInput.module('core', {})).toThrowError(
              /Invalid input: Invalid input properties/
            );
          } finally {
            // Restore original function
            modules.core.ops.resolve.withValidation.unknownInput =
              originalValidate;
          }
        });

        it('should work with different module types', () => {
          // Test with npm module
          const npmInput = { name: 'test-package' };
          const npmResult = resolveInput.module('npm', npmInput);
          expect(npmResult).toHaveProperty('name', 'test-package');

          // Test with block module
          const blockInput = {
            category: 'widgets',
            slug: 'test-block',
            namespace: 'test-ns',
            title: 'Test Block'
          };
          const blockResult = resolveInput.module('block', blockInput);
          expect(blockResult).toHaveProperty('category', 'widgets');
        });
      });
    });
  });
  describe('Builder Pattern', () => {
    it('should allow incremental building of configuration', () => {
      const builder = new Builder({ ...defaultCore });

      const result = builder
        .block({ category: 'custom' })
        .core({ repository: 'example.com' })
        .npm({ name: 'custom-pkg' })
        .php({ classScope: 'CustomClass' })
        .wp({ tags: ['tag1', 'tag2'] })
        .build();

      expect(result.block.category).toBe('custom');
      expect(result.npm.name).toBe('custom-pkg');
    });
  });
});
