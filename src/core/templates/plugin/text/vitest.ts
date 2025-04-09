import type { ConfiguredTemplate } from '#config';
export const create = (): ConfiguredTemplate => ({
  filename: 'vitest.config.ts',
  generate: ({
    core: { outputDirectory = process.cwd() } = {}
  }) => `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    cache: { dir: \`${outputDirectory}/.cache/vitest\` },
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json'
    },
    coverage: {
      ignoreEmptyLines: true,
      reportsDirectory: \`${outputDirectory}/.coverage\`,    
      provider: 'v8',
      enabled: true,
      reporter: ['text'],
      thresholds: {
        100: true,
        perFile: true
      },
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
});`
});
