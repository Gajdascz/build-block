import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: 'tsdoc.json',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.tsdoc,
      tagDefinitions: [
        { tagName: '@important', syntaxKind: 'block' },
        { tagName: '@module', syntaxKind: 'block' }
      ]
    })
});

export { create };
