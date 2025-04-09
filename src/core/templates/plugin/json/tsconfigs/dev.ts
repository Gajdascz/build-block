import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: 'tsconfig.dev.json',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.tsconfig,
      extends: './tsconfig.base.json',
      compilerOptions: {
        rootDir: './',
        allowJs: true,
        noEmit: true,
        types: ['@typescript-eslint/utils', '@types/node']
      },
      include: ['*.ts', './eslint.config.ts', './example/**/*.ts'],
      exclude: ['./build/**', './dist/**', '**/node_modules/**']
    })
});

export { create };
