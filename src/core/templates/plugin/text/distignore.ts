import type { ConfiguredTemplate } from '#config';
export const create = (): ConfiguredTemplate => ({
  filename: '.distignore',
  generate: () => `
# Development files that should be excluded from distributions
node_modules

.git
.github
.gitignore
.gitattributes

.vscode



pnpm-lock.yaml
package-lock.json

eslint.config.*
.eslintrc
.eslintignore
.eslintrc.js

vitest.config.*
.idea
.editorconfig

.nvmrc
.stylelintrc
.npmrc
.babelrc
.prettier*

coverage/
.coverage/

.cache/

tests
__tests__
*.test.js
*.test.ts
*.spec.js
*.spec.ts
phpunit.xml
docker-compose.yml
webpack.config.js
.wordpress-org
build
docs
patches

/phpcs-sniffs/
*.DS_Store
.DS_Store
.distignore
.gherkin-lintignore
.gherkin-lintrc
.phpunit.result.cache
.typos.toml
.wp-env.json
.wp-env.override.json
behat.yml
codecov.yml
composer.lock
phpcs.xml
phpcs.xml.dist
phpmd.xml
phpstan.neon
phpstan.neon.dist
phpunit.xml.dist

CONTRIBUTING.md
README.md
SECURITY.md
`
});
