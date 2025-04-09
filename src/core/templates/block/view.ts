import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: 'view.ts',
  relativePath: 'src',
  generate: ({ core: { namespace } }) => `/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the \`viewScript\` property
 * in \`block.json\` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * \`\`\`ts
 * {
 *   "viewScript": "file:./view.ts"
 * }
 * \`\`\`
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the \`viewScript\` property from \`block.json\`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */
import { store, getContext } from '@wordpress/interactivity';

type ServerState = {
	state: {
		isDark: boolean;
		darkText: string;
		lightText: string;
	};
};

type Context = {
	isOpen: boolean;
};

const storeDef = {
	state: {
		get themeText(): string {
			return state.isDark ? state.darkText : state.lightText;
		},
	},
	actions: {
		toggleOpen() {
			const context = getContext< Context >();
			context.isOpen = ! context.isOpen;
		},
		toggleTheme() {
			state.isDark = ! state.isDark;
		},
	},
	callbacks: {
		logIsOpen: () => {
			const { isOpen } = getContext< Context >();
			// Log the value of \`isOpen\` each time it changes.
			console.log( \`Is open: \${ isOpen }\` );
		},
	},
};

type Store = ServerState & typeof storeDef;

const { state } = store< Store >( "${namespace}", storeDef );
`
});
export { create };
