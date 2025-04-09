import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';

const create = (): ConfiguredTemplate => ({
  filename: '.babelrc',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.babel,
      presets: ['@wordpress/babel-preset-default'],
      plugins: [['@babel/plugin-syntax-import-attributes']]
    })
});

export { create };
