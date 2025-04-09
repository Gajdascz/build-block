import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: '.vscode/launch.json',
  generate: () =>
    JSON.stringify({
      version: '0.0.0',
      configurations: [
        {
          type: 'node',
          request: 'launch',
          name: 'Debug Current Test File',
          autoAttachChildProcesses: true,
          skipFiles: ['<node_internals>/**', '**/node_modules/**'],
          program: '${workspaceRoot}/node_modules/vitest/vitest.mjs',
          args: ['run', '${relativeFile}'],
          smartStep: true,
          console: 'integratedTerminal'
        }
      ]
    })
});
export { create };
