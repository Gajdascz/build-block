import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../validator/__testUtils.js';
import * as WpCore from './wordpress-core.js';

describe('WordPress Core Types Module', () => {
  const { expect: _expect } = __TestUtils;

  describe('Validation', () => {
    describe('WpCore.ops.validate.prop validators', () => {
      it('validates updateUrl', () => {
        _expect.valid(
          WpCore.ops.validate.prop.updateUrl('https://example.com/update')
        );
        _expect.valid(WpCore.ops.validate.prop.updateUrl('')); // Empty is allowed
        _expect.valid(WpCore.ops.validate.prop.updateUrl('not-a-url'));
      });

      it('validates tags', () => {
        _expect.valid(
          WpCore.ops.validate.prop.tags([
            'tag1',
            'tag2',
            'tag3',
            'tag4',
            'tag5'
          ])
        );
        _expect.valid(WpCore.ops.validate.prop.tags([])); // Empty is allowed
        _expect.invalid(
          WpCore.ops.validate.prop.tags([
            'tag1',
            'tag2',
            'tag3',
            'tag4',
            'tag5',
            'tag6'
          ])
        ); // More than 5 tags
        _expect.invalid(WpCore.ops.validate.prop.tags('not-an-array' as any));
      });

      it('validates requiresPlugins', () => {
        _expect.valid(
          WpCore.ops.validate.prop.requiresPlugins(['plugin1', 'plugin2'])
        );
        _expect.valid(WpCore.ops.validate.prop.requiresPlugins([])); // Empty is allowed
        _expect.invalid(
          WpCore.ops.validate.prop.requiresPlugins([123, true] as any)
        );
      });

      it('validates contributors', () => {
        _expect.valid(
          WpCore.ops.validate.prop.contributors(['user1', 'user2'])
        );
        _expect.valid(WpCore.ops.validate.prop.contributors([])); // Empty is allowed
        _expect.invalid(
          WpCore.ops.validate.prop.contributors([123, true] as any)
        );
      });
    });
    describe('WpCore.ops.validate validatorsConfig', () => {
      it('validates valid input configurations', () => {
        _expect.valid(WpCore.ops.validate.inputConfig({}));

        _expect.valid(
          WpCore.ops.validate.inputConfig({
            contributors: ['user1', 'user2'],
            tags: ['tag1', 'tag2']
          })
        );

        _expect.valid(
          WpCore.ops.validate.inputConfig({
            contributors: ['user1', 'user2'],
            tags: ['tag1', 'tag2', 'tag3'],
            updateUrl: 'https://example.com/updates',
            requiresPlugins: ['plugin1', 'plugin2']
          })
        );
      });

      it('validates valid resolved configurations', () => {
        _expect.valid(
          WpCore.ops.validate.resolvedConfig({
            contributors: [],
            tags: [],
            updateUrl: '',
            requiresPlugins: [],
            version: WpCore.data.static.version
          })
        );

        _expect.valid(
          WpCore.ops.validate.resolvedConfig({
            contributors: ['user1', 'user2'],
            tags: ['tag1', 'tag2'],
            updateUrl: 'https://example.com/updates',
            requiresPlugins: ['plugin1'],
            version: WpCore.data.static.version
          })
        );
      });

      it('rejects invalid resolved configurations', () => {
        _expect.invalid(
          WpCore.ops.validate.resolvedConfig({
            contributors: [],
            tags: [],
            updateUrl: '',
            requiresPlugins: []
            // version is missing
          })
        );
        _expect.invalid(
          WpCore.ops.validate.resolvedConfig({
            contributors: [],
            tags: [],
            updateUrl: '',
            requiresPlugins: [],
            version: '1.a.3' // Invalid version format
          })
        );
        _expect.invalid(
          WpCore.ops.validate.resolvedConfig({
            contributors: [],
            tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'], // Too many
            updateUrl: '',
            requiresPlugins: [],
            version: WpCore.data.static.version
          })
        );
      });

      it('validators properly handle edge cases', () => {
        _expect.invalid(WpCore.ops.validate.inputConfig(null));
        _expect.invalid(WpCore.ops.validate.inputConfig(undefined));
        _expect.invalid(WpCore.ops.validate.inputConfig('string'));
        _expect.invalid(WpCore.ops.validate.inputConfig(123));

        _expect.invalid(WpCore.ops.validate.resolvedConfig(null));
        _expect.invalid(WpCore.ops.validate.resolvedConfig(undefined));
        _expect.invalid(WpCore.ops.validate.resolvedConfig('string'));
        _expect.invalid(WpCore.ops.validate.resolvedConfig(123));
      });
    });
  });

  describe('Resolution', () => {
    it('resolves minimal input to a complete config', () => {
      const minimalInput: WpCore.Types['input'] = {}; // All properties are optional
      const result = WpCore.ops.resolve.input(minimalInput);
      expect(result).toHaveProperty('value', {
        ...WpCore.data.defaults,
        ...WpCore.data.static
      });
    });
    it('preserves custom values from input when resolving', () => {
      const fullInput: WpCore.Types['input'] = {
        contributors: ['user1', 'user2'],
        tags: ['tag1', 'tag2', 'tag3'],
        updateUrl: 'https://example.com/updates',
        requiresPlugins: ['shopping-cart', 'advanced-custom-fields']
      };

      const result = WpCore.ops.resolve.input(fullInput).value;

      expect(result).toMatchObject({
        contributors: ['user1', 'user2'],
        tags: ['tag1', 'tag2', 'tag3'],
        updateUrl: 'https://example.com/updates',
        requiresPlugins: ['shopping-cart', 'advanced-custom-fields'],
        version: WpCore.data.static.version
      });
    });
    it('uses default values for missing optional properties', () => {
      const partialInput: WpCore.Types['input'] = {
        contributors: ['user1', 'user2']
        // Other properties omitted
      };

      const result = WpCore.ops.resolve.input(partialInput).value!;

      expect(result.contributors).toEqual(['user1', 'user2']);
      expect(result.tags).toEqual(WpCore.data.defaults.tags);
      expect(result.updateUrl).toBe(WpCore.data.defaults.updateUrl);
      expect(result.requiresPlugins).toEqual(
        WpCore.data.defaults.requiresPlugins
      );
    });
  });
});
