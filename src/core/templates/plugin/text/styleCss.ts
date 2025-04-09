import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: 'style.scss',
  relativePath: 'src',
  generate: () => `/**
 * The following styles get applied both on the front of your site
 * and in the editor.
 *
 * Replace them with your own styles or remove the file completely.
 */`
});

export { create };
