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
        'PKief.material-icon-theme',
        'mxsdev.typescript-explorer'
      ]
    })
});
export { create };
