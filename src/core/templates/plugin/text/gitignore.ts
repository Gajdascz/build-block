import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: '.gitignore',
  generate: () => `node_modules
*.log
*.env
*.local
*.coverage
coverage
*.tsbuildinfo
dist/
build/
.cache/
`
});

export { create };
