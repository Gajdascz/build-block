import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: 'composer.json',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.composer,
      'require-dev': { 'php-stubs/wordpress-stubs': '^6.7' }
    })
});

export { create };
