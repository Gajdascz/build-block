import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: 'tsconfig.test.json',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.tsconfig,
      extends: './tsconfig.base.json',
      compilerOptions: {
        rootDir: './',
        strict: false,
        strictNullChecks: true,
        allowUnusedLabels: true,
        allowUnreachableCode: true,
        noImplicitAny: false,
        strictFunctionTypes: false,
        strictBindCallApply: false,
        strictPropertyInitialization: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: false,
        noFallthroughCasesInSwitch: false,
        noUncheckedIndexedAccess: false,
        noImplicitOverride: false
      },
      include: ['./**/*.test.ts', './**/__test*'],
      exclude: ['./dist/**', './build/**', 'node_modules', '**/docs/**']
    })
});

export { create };
