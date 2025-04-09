import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: '.stylelintrc',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.stylelint,
      extends: ['@wordpress/stylelint-config']
    })
});

export { create };
