import { LIMITS, VERSIONS } from '#constants';
import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../validator/__testUtils';
import * as WpBlocks from './wordpress-block';

const SLUG = 'test-block';
const NS = 'test-namespace';
const TITLE = 'Test Block';
const NAME = `${NS}/${SLUG}`;
const ARGS = { namespace: NS, slug: SLUG, title: TITLE };

describe('WordPress Block Types Module', () => {
  const { expect: _expect } = __TestUtils;

  describe('Validation', () => {
    describe('Block Name Validator', () => {
      it('should validate a proper block name', () => {
        const result = WpBlocks.ops.validate.prop.name(
          'valid-namespace/valid-slug'
        );
        _expect.valid(result);
        expect(result.value).toBe('valid-namespace/valid-slug');
      });

      it('should reject a block name with invalid namespace length', () => {
        const shortNamespace = 'a'.repeat(LIMITS.min.namespace - 1);
        const validSlug = 'b'.repeat(LIMITS.min.slug);
        const name = `${shortNamespace}/${validSlug}`;

        const result = WpBlocks.ops.validate.prop.name(name);
        _expect.invalid(result);
      });

      it('should reject a block name with invalid slug length', () => {
        const validNamespace = 'a'.repeat(LIMITS.min.namespace);
        const shortSlug = 'b'.repeat(LIMITS.min.slug - 1);
        const name = `${validNamespace}/${shortSlug}`;

        const result = WpBlocks.ops.validate.prop.name(name);
        _expect.invalid(result);
      });

      it('should reject a block name without a forward slash', () => {
        const result = WpBlocks.ops.validate.prop.name('invalidblockname');
        _expect.invalid(result);
      });

      it('should reject a block name with extra forward slashes', () => {
        const result = WpBlocks.ops.validate.prop.name('too/many/slashes');
        _expect.invalid(result);
      });
    });

    describe('WpBlocks.ops.validate.prop.keywords validator', () => {
      it('validates valid keywords array', () => {
        _expect.valid(
          WpBlocks.ops.validate.prop.keywords(['test', 'block', 'custom'])
        );
        _expect.valid(WpBlocks.ops.validate.prop.keywords([]));
      });
      it('rejects invalid keywords', () => {
        _expect.invalid(WpBlocks.ops.validate.prop.keywords('not-an-array'));
        _expect.invalid(WpBlocks.ops.validate.prop.keywords([123, true]));
      });
    });

    describe('WpBlocks.ops.validate.prop.supports validator', () => {
      it('validates valid supports object with interactivity', () => {
        _expect.valid(
          WpBlocks.ops.validate.prop.supports({ interactivity: true })
        );
        _expect.valid(
          WpBlocks.ops.validate.prop.supports({
            interactivity: true,
            html: false,
            multiple: false
          })
        );
      });
      it('rejects supports object without interactivity', () => {
        _expect.invalid(WpBlocks.ops.validate.prop.supports({}));
        _expect.invalid(
          WpBlocks.ops.validate.prop.supports({ interactivity: false })
        );
        _expect.invalid(WpBlocks.ops.validate.prop.supports({ html: true }));
      });
    });

    describe('WpBlocks.ops.validate.inputConfig validator', () => {
      it('validates valid input objects', () => {
        _expect.valid(WpBlocks.ops.validate.inputConfig(ARGS));
      });

      it('rejects input objects missing required fields', () => {
        _expect.invalid(
          WpBlocks.ops.validate.inputConfig({
            namespace: 'test-namespace',
            title: 'Test Block' // Missing slug
          })
        );
      });
      describe('apiVersion validator', () => {
        it('should validate correct apiVersion', () => {
          const result = WpBlocks.ops.validate.prop.apiVersion(
            VERSIONS.wpBlockApi
          );
          _expect.valid(result);
          expect(result.value).toBe(VERSIONS.wpBlockApi);
        });

        it('should reject incorrect apiVersion', () => {
          const wrongNumber = WpBlocks.ops.validate.prop.apiVersion(1);
          _expect.invalid(wrongNumber);
          const wrongString = WpBlocks.ops.validate.prop.apiVersion('1.0.0');
          _expect.invalid(wrongString);
          const nullValue = WpBlocks.ops.validate.prop.apiVersion(null);
          _expect.invalid(nullValue);
          const undefinedValue =
            WpBlocks.ops.validate.prop.apiVersion(undefined);
          _expect.invalid(undefinedValue);
        });
      });
      it('rejects non-object inputs', () => {
        _expect.invalid(WpBlocks.ops.validate.inputConfig('string'));
        _expect.invalid(WpBlocks.ops.validate.inputConfig(['array']));
        _expect.invalid(WpBlocks.ops.validate.inputConfig(123));
        _expect.invalid(WpBlocks.ops.validate.inputConfig(null));
        _expect.invalid(WpBlocks.ops.validate.inputConfig(undefined));
      });
    });

    describe('WpBlocks.ops.validate.resolvedConfig validator', () => {
      it('validates complete resolved objects', () => {
        const validResolved: WpBlocks.Types['resolved'] = {
          namespace: 'test-namespace',
          slug: 'test-block',
          name: NAME,
          title: TITLE,
          category: 'widgets',
          icon: 'block-default',
          description: 'A test block',
          keywords: ['test', 'block'],
          textdomain: 'test-block',
          supports: { interactivity: true },
          ancestor: [],
          example: {},
          parent: [],
          providesContext: {},
          styles: [],
          usesContext: [],
          attributes: {},
          ...WpBlocks.data.static
        };
        _expect.valid(WpBlocks.ops.validate.resolvedConfig(validResolved));
      });

      it('rejects non-object resolved inputs', () => {
        _expect.invalid(WpBlocks.ops.validate.resolvedConfig('string'));
      });

      it('rejects resolved objects without interactivity support', () => {
        const invalidResolved = {
          name: NS,
          title: TITLE,
          category: 'widgets',
          icon: 'block-default',
          description: 'A test block',
          keywords: ['test', 'block'],
          textdomain: 'test-block',
          supports: { html: true }, // Missing interactivity
          ancestor: [],
          deprecated: [],
          example: {},
          parent: [],
          providesContext: {},
          styles: [],
          transforms: {},
          usesContext: [],
          attributes: {},
          ...WpBlocks.data.static
        };
        _expect.invalid(WpBlocks.ops.validate.resolvedConfig(invalidResolved));
      });
    });
    describe('ancestor validator', () => {
      it('should validate valid ancestor values', () => {
        // Valid array of block names
        const validAncestors = [
          'core-ns/block',
          'my-namespace/my-block',
          'custom-plugin/special-block'
        ];
        const result = WpBlocks.ops.validate.prop.ancestor(validAncestors);
        _expect.valid(result);
        expect(result.value).toEqual(validAncestors);

        // Empty array is also valid
        const emptyResult = WpBlocks.ops.validate.prop.ancestor([]);
        _expect.valid(emptyResult);
        expect(emptyResult.value).toEqual([]);
      });

      it('should reject invalid ancestor values', () => {
        // Invalid ancestor - missing namespace
        const missingNamespace = ['block-without-namespace'];
        const missingNamespaceResult =
          WpBlocks.ops.validate.prop.ancestor(missingNamespace);
        _expect.invalid(missingNamespaceResult);

        // Invalid ancestor - missing slug
        const missingSlug = ['namespace/'];
        const missingSlugResult =
          WpBlocks.ops.validate.prop.ancestor(missingSlug);
        _expect.invalid(missingSlugResult);

        // Invalid ancestor - namespace too short
        const shortNamespace = [`a/${'b'.repeat(LIMITS.min.slug)}`];
        const shortNamespaceResult =
          WpBlocks.ops.validate.prop.ancestor(shortNamespace);
        _expect.invalid(shortNamespaceResult);

        // Invalid ancestor - slug too short
        const shortSlug = [`${'a'.repeat(LIMITS.min.namespace)}/b`];
        const shortSlugResult = WpBlocks.ops.validate.prop.ancestor(shortSlug);
        _expect.invalid(shortSlugResult);

        // Invalid ancestor - not an array
        const notArray = 'core/block';
        const notArrayResult = WpBlocks.ops.validate.prop.ancestor(notArray);
        _expect.invalid(notArrayResult);

        // Invalid ancestor - array with non-string items
        const nonStringItems = ['core/block', 123, { name: 'invalid' }];
        const nonStringItemsResult =
          WpBlocks.ops.validate.prop.ancestor(nonStringItems);
        _expect.invalid(nonStringItemsResult);
      });
    });
  });

  describe('resolve', () => {
    it('resolves minimal input to a complete config', () => {
      const result = WpBlocks.ops.resolve.input(ARGS).value;
      expect(result).toMatchObject({
        ...WpBlocks.data.defaults,
        name: NAME,
        title: TITLE,
        textdomain: SLUG,
        supports: { interactivity: true },
        ...WpBlocks.data.static
      });
    });

    it('preserves custom values from input when resolving', () => {
      const customNs = 'custom-namespace';
      const customSlug = 'custom-slug';
      const customTitle = 'Custom Block';
      const fullInput: WpBlocks.Types['input'] = {
        title: customTitle,
        namespace: customNs,
        slug: customSlug,
        description: 'A custom block description',
        category: 'media',
        keywords: ['custom', 'fancy', 'block'],
        icon: 'star-filled',
        supports: { html: false, multiple: true, interactivity: true }
      };

      const result = WpBlocks.ops.resolve.input(fullInput).value;

      expect(result).toMatchObject({
        name: `${customNs}/${customSlug}`,
        title: customTitle,
        description: 'A custom block description',
        category: 'media',
        keywords: ['custom', 'fancy', 'block'],
        icon: 'star-filled',
        textdomain: customSlug,
        supports: { interactivity: true, html: false, multiple: true }
      });
    });

    it('enforces interactivity support even when not specified', () => {
      const input: WpBlocks.Types['input'] = {
        title: 'Test Block',
        namespace: 'string',
        slug: 'slugstring',
        //@ts-expect-error Testing invalid input
        supports: { html: false, interactivity: false }
      };

      const result = WpBlocks.ops.resolve.input(input).value!;

      expect(result.supports).toEqual({ html: false, interactivity: true });
    });

    it('uses default values for missing optional properties', () => {
      const partialInput: WpBlocks.Types['input'] = {
        title: 'Test Block',
        namespace: 'string',
        slug: 'slugstring'
      };

      const result = WpBlocks.ops.resolve.input(partialInput).value!;

      expect(result.icon).toBe(WpBlocks.data.defaults.icon);
      expect(result.category).toBe(WpBlocks.data.defaults.category);
      expect(result.description).toBe(WpBlocks.data.defaults.description);
      expect(result.keywords).toEqual(WpBlocks.data.defaults.keywords);
    });
  });
});
