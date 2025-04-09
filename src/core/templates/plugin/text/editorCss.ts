import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: 'editor.scss',
  relativePath: 'src',
  generate: () => `/**
   * The following styles get applied inside the editor only.
   *
   * Replace them with your own styles or remove the file completely.
   */`
});

export { create };
