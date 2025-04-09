import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: 'tsconfig.json',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.tsconfig,
      extends: './tsconfig.base.json',
      compilerOptions: { rootDir: './src' },
      include: ['./src/**/*.ts', './src/**/*.tsx', './src/block.json'],
      exclude: [
        '**/node_modules/**',
        '**/build/**',
        '**/*.test.ts',
        '**/dist/**',
        '**/*__test*/**'
      ]
    })
});

export { create };
