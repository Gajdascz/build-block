import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
import type * as WpBlocks from '@wordpress/blocks';
/** https://developer.wordpress.org/block-editor/getting-started/fundamentals/block-json/ */
interface BlockJson extends WpBlocks.BlockConfiguration {
  $schema: typeof JSON_SCHEMAS.block;
  render: string;
  viewScriptModule: string;
}

const create = (): ConfiguredTemplate =>
  ({
    filename: 'block.json',
    relativePath: 'src',
    generate: ({ block: { ...rest } }) =>
      JSON.stringify({
        $schema: JSON_SCHEMAS.block,
        ...rest,
        namespace: undefined,
        slug: undefined
      })
  }) as const;

export { type BlockJson, create };
