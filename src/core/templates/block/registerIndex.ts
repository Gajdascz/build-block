import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: 'index.ts',
  relativePath: 'src',
  generate: () => `/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
import { type BlockConfiguration, registerBlockType } from '@wordpress/blocks';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing \`style\` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor. All other files
 * get applied to the editor only.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';
import './editor.scss';

/**
 * Internal dependencies
 */
import blockConfig from './block.json';
import Edit, { type BlockAttributes } from './edit';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/getting-started/fundamentals/registration-of-a-block/
 */
registerBlockType(blockConfig as BlockConfiguration<BlockAttributes>, {
  edit: Edit
});
`
});

export { create };
