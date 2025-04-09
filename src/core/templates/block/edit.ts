import type { ConfiguredTemplate } from '#config';

const create = (): ConfiguredTemplate => ({
  filename: 'edit.tsx',
  relativePath: 'src',
  generate: ({ core: { slug } }) => `/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * [useBlockProps]: React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { type BlockEditProps } from '@wordpress/blocks';
import {
  PanelBody,
  TextControl,
  SelectControl,
  ToggleControl,
  ColorPicker
} from '@wordpress/components';
import blockConfig from './block.json';

type BlockAttributes = {
  [A in keyof typeof blockConfig.attributes]: (typeof blockConfig.attributes)[A]['default'];
};

type BlockAlignmentType = 'left' | 'center' | 'right';
const isBlockAlignmentType = (value: unknown): value is BlockAlignmentType =>
  typeof value === 'string'
  && (value === 'left' || value === 'center' || value === 'right');

export { type BlockAlignmentType, type BlockAttributes, isBlockAlignmentType };

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 */
export default function Edit({
  attributes,
  setAttributes
}: BlockEditProps<BlockAttributes>) {
  const { 
    content = '',
    alignment = 'left',
    backgroundColor = '#ffffff',
    showDetails = false,
  } = attributes;

  const blockProps = useBlockProps({
    style: { textAlign: alignment as React.CSSProperties['textAlign'], backgroundColor }
  });
  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Basic Settings', '${slug}')} initialOpen={true}>
          <TextControl
            label={__('Content','${slug}')}
            value={content}
            onChange={(value) => setAttributes({ content: value })}
            help={__('Enter the main content for this block','${slug}')}
          />
          
          <SelectControl
            label={__('Text Alignment','${slug}')}
            value={isBlockAlignmentType(alignment) ? alignment : 'left'}
            options={[
              { label: __('Left','${slug}'), value: 'left' },
              { label: __('Center','${slug}'), value: 'center' },
              { label: __('Right','${slug}'), value: 'right' }
            ]}
            onChange={(value) => setAttributes({ alignment: value })}
          />
          
          <ToggleControl
            label={__('Show Details','${slug}')}
            checked={showDetails}
            onChange={(value) => setAttributes({ showDetails: value })}
            help={showDetails ? __('Showing details','${slug}') : __('Details hidden','${slug}')}
          />
          
          <div className="${slug}-color-picker">
            <p>{__('Background Color','${slug}')}</p>
            <ColorPicker
              color={backgroundColor}
              onChange={(value) => setAttributes({ backgroundColor: value })}
              enableAlpha
            />
          </div>
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <p className="${slug}-content">{content || __('Add content...','${slug}')}</p>
        
        {showDetails && (
          <div className="${slug}-details">
            {__('Additional details shown here','${slug}')}
          </div>
        )}
      </div>
    </>
  );
}
`
});
export { create };
