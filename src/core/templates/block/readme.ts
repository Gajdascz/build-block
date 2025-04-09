import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: 'README.md',
  generate: () => `# Interactive Block
> **Note** Check the
> [Interactivity API Reference docs in the Block Editor handbook](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/)
> to learn more about the Interactivity API.

>BlockEditor
  - [Handbook](https://developer.wordpress.org/block-editor/)
  - [Package & API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/)

>[Blocks Package & API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/)

>[Components Package & API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-components/)'

>[Element Package & API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-element/)

`
});

export { create };
