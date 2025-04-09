import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: '.npmrc',
  generate: () => `auto-install-peers=true
strict-peer-dependencies=false
legacy-peer-deps=true`
});

export { create };
