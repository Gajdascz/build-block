import js from '@eslint/js';
import wpeslint from '@wordpress/eslint-plugin';
import type { ESLint } from 'eslint';
import prettierConfig from 'eslint-config-prettier';
import * as importPlugin from 'eslint-plugin-import';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint, { type ConfigWithExtends } from 'typescript-eslint';
const wpCfg = (
  wpeslint as {
    configs: {
      ['recommended-with-formatting']: {
        globals: Record<string, boolean>;
        settings: Record<string, unknown>;
        rules: Record<string, string>;
      };
    };
  }
).configs['recommended-with-formatting'];

const ignores: ConfigWithExtends['ignores'] = [
  './dist/**',
  './docs/**',
  '**/node_modules/**',
  './build/**',
  '**/*.d.ts'
];
const rules: ConfigWithExtends['rules'] = {
  'tsdoc/syntax': 'warn',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { fixStyle: 'inline-type-imports', prefer: 'type-imports' }
  ],
  '@typescript-eslint/consistent-type-exports': [
    'error',
    { fixMixedExportsWithInlineTypeSpecifier: true }
  ],
  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    { allowNumber: true, allowBoolean: true, allowNever: true }
  ],
  '@typescript-eslint/no-unnecessary-type-parameters': 'off',
  '@typescript-eslint/no-explicit-any': [
    'error',
    { fixToUnknown: true, ignoreRestArgs: true }
  ],
  '@typescript-eslint/consistent-indexed-object-style': ['off'],
  '@typescript-eslint/no-dynamic-delete': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'off',
  '@typescript-eslint/prefer-reduce-type-parameter': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  ...wpCfg.rules
} as const;

const createCfg = (
  name: string,
  files: string[],
  project: string,
  _ignores: string[] = [],
  _ruleOverrides: ConfigWithExtends['rules'] = {}
): ConfigWithExtends =>
  ({
    name,
    files: [...files],
    ignores: [...ignores, ..._ignores],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin as ESLint.Plugin,
      tsdoc
    },
    settings: {
      ...wpCfg.settings,
      /**
       * https://github.com/WordPress/gutenberg/blob/e9d5e0fcb7b1c41915119f6dc5f3c19b02c1077d/packages/eslint-plugin/configs/recommended.js#L37C1-L44C4
       */
      'import/resolver': {
        typescript: { project },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
      }
    },
    languageOptions: {
      globals: { ...wpCfg.globals },
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: { project, tsconfigRootDir: process.cwd() }
    },
    rules: {
      ...rules,
      /**
       * https://github.com/WordPress/gutenberg/blob/e9d5e0fcb7b1c41915119f6dc5f3c19b02c1077d/packages/eslint-plugin/configs/recommended.js#L52-L71
       */
      'no-duplicate-imports': 'off',
      'import/no-duplicates': 'error',
      // Don't require redundant JSDoc types in TypeScript files.
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      // Use eslint for unused variable and parameter detection.
      // This overlaps with TypeScript noUnusedLocals and noUnusedParameters settings.
      // TypeScript may only run on a subset of files. Prefer eslint which is more
      // likely to run on the entire codebase.
      'no-unused-vars': 'off',

      /**
       * @important Cannot resolve error for \@typescript-eslint/no-unused-vars:
       * ```
       * ESLint: 9.24.0
       * Error: Key "rules": Key "@typescript-eslint/no-unused-vars":
       * Value {"ignoreRestSiblings":true,"caughtErrors":false} should be
       * string.
       * Value {"ignoreRestSiblings":true,"caughtErrors":false} should be equal
       * to one of the allowed values.
       * Value false should be string.
       * Value false should be equal to one of the allowed values.
       * Value {"ignoreRestSiblings":true,"caughtErrors":false} should match
       * exactly one schema in oneOf.
       * ```
       */
      '@typescript-eslint/no-unused-vars': 'off',

      // no-shadow doesn't work correctly in TS, so let's use a TS-dedicated version instead.
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/method-signature-style': 'error',
      ..._ruleOverrides
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      prettierConfig
    ]
  }) as const;

export default tseslint.config(
  createCfg('src', ['src/**/*.ts', 'src/**/*.tsx'], './tsconfig.json', [
    '**/*.test.ts'
  ]),
  createCfg(
    'dev',
    ['*.ts', 'examples/**/*.ts', '__mocks__/**/*.ts'],
    './tsconfig.dev.json',
    ['./src/**', '**/*.test.ts']
  ),
  createCfg(
    'test',
    ['**/*.test.ts', '**/__test*'],
    './tsconfig.test.json',
    [],
    {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off'
    }
  )
);
