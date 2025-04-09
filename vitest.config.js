import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    cache: { dir: `${process.cwd()}/.cache/vitest` },
    setupFiles: [`${process.cwd()}/__mocks__/index.ts`],
    typecheck: {
      enabled: true,
      tsconfig: `${process.cwd()}/tsconfig.test.json`
    },
    alias: {
      '#config': `${process.cwd()}/src/core/config/index.ts`,
      '#validator': `${process.cwd()}/src/core/validator/index.ts`,
      '#utils': `${process.cwd()}/src/core/utils/index.ts`,
      '#constants': `${process.cwd()}/src/core/constants/index.ts`
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      thresholds: { 100: true, perFile: true },
      reporter: ['text'],
      ignoreEmptyLines: true,
      reportsDirectory: `${process.cwd()}/.coverage`,
      exclude: [
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/docs/**',
        '**/dev/**',
        '**/node_modules/**',
        '**/__tests__/**',
        '**/[.]**',
        '**/*.d.ts',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        '**/{vitest,build,eslint,prettier}.config.*',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
        '**/.cache/**',
        '**/coverage/**',
        '**/.github/**',
        '**/index.*',
        '**/README.*',
        '**/LICENSE*',
        '**/CHANGELOG*',
        '**/CONTRIBUTING*',
        '**/templates/**',
        '**/bin/**',
        '**/examples/**'
      ]
    }
  }
});
