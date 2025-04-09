import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: '.prettierrc',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.prettier,
      arrowParens: 'always',
      endOfLine: 'lf',
      jsxSingleQuote: true,
      printWidth: 80,
      proseWrap: 'always',
      quoteProps: 'as-needed',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'none',
      useTabs: false,
      experimentalTernaries: true,
      experimentalOperatorPosition: 'start',
      objectWrap: 'collapse'
    })
});
export { create };
