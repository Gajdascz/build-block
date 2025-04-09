import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';

const create = (): ConfiguredTemplate => ({
  filename: 'package.json',
  generate: ({
    core: {
      authorName,
      authorEmail,
      authorUrl,
      description,
      license,
      repository,
      version
    },
    npm: { name, contributors, keywords }
  }) =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.package,
      description,
      version,
      name,
      ...(keywords.length > 0 && { keywords }),
      ...(authorName.length > 0 && {
        author: {
          name: authorName,
          ...(authorEmail.length > 0 && { email: authorEmail }),
          ...(authorUrl.length > 0 && { url: authorUrl })
        }
      }),
      ...(contributors.length > 0 && { contributors }),
      ...(repository.length > 0 && { repository }),

      license: license.type,
      types: 'build/index.d.ts',
      main: 'build/index.js',
      type: 'module',
      scripts: {
        'test:unit': 'vitest',
        build: 'wp-scripts build --experimental-modules',
        format: 'prettier --write --config .prettierrc .',
        'lint:css': 'wp-scripts lint-style',
        'lint:scripts': 'eslint . --config eslint.config.ts --fix',
        cleanup:
          'pnpm run lint:css && pnpm run lint:scripts && pnpm run format',
        'packages-update': 'wp-scripts packages-update',
        'plugin-zip': 'wp-scripts plugin-zip',
        'wp-dist': 'wp-scripts plugin-zip --include-dotfiles=false',
        start: 'wp-scripts start --experimental-modules'
      },
      files: ['build/**', 'LICENSE'],
      dependencies: {
        '@wordpress/block-editor': '^14.15.0',
        '@wordpress/blocks': '^12.35.0',
        '@wordpress/components': '^29.6.0',
        '@wordpress/element': '^6.20.0',
        '@wordpress/i18n': '^5.20.0',
        '@wordpress/icons': '^10.20.0',
        '@wordpress/interactivity': '^6.20.0'
      },
      devDependencies: {
        jiti: '^2.4.2',
        prettier: '^3.5.3',
        'eslint-plugin-import': '^2.31.0',
        'eslint-plugin-tsdoc': '^0.4.0',
        '@eslint/eslintrc': '^3.3.1',
        '@babel/preset-env': '^7.26.9',
        '@eslint/js': '^9.24.0',
        '@types/node': '^22.13.11',
        '@types/react': '^19.0.12',
        '@types/react-dom': '^19.0.4',
        '@types/wordpress__block-editor': '^11.5.16',
        '@types/wordpress__blocks': '^12.5.17',
        '@vitest/coverage-v8': '3.0.9',
        '@wordpress/eslint-plugin': '^22.6.0',
        '@wordpress/scripts': '^30.13.0',
        '@wordpress/stylelint-config': '^23.12.0',
        eslint: '^9.24.0',
        'eslint-config-prettier': '^10.1.1',
        'eslint-import-resolver-typescript': '^4.2.2',
        typescript: '^5.8.3',
        'typescript-eslint': '^8.27.0',
        vitest: '^3.0.9',
        'vite-tsconfig-paths': '^5.1.4'
      },
      packageManager:
        'pnpm@10.8.0+sha512.0e82714d1b5b43c74610193cb20734897c1d00de89d0e18420aebc5977fa13d780a9cb05734624e81ebd81cc876cd464794850641c48b9544326b5622ca29971'
    })
});

export { create };
