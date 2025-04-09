import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: '.prettierignore',
  generate: () => `# Directories
build/
dist/
node_modules/
vendor/
coverage/
.cache/

# Files
**/*.md
*.php
.DS_Store
*.env
`
});

export { create };
