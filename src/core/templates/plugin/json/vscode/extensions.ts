import type { ConfiguredTemplate } from '#config';

const create = (): ConfiguredTemplate => ({
  filename: 'extensions.json',
  relativePath: '.vscode',
  generate: () =>
    JSON.stringify({
      recommendations: [
        'aaron-bond.better-comments',
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'mxsdev.typescript-explorer'
      ]
    })
});
export { create };
