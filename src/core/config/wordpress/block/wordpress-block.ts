/**
 * Since this module works directly with the word press internal block configuration type, when passing to createBaseTypeModule the system gets overloaded and freezes the environment. For now, I will just mock the api.
 */
// import { createBaseTypeModule } from '../../base.type-module.js';
import { LIMITS, VERSIONS } from '#constants';
import { Validator } from '#validator';
import type * as WpBlocks from '@wordpress/blocks';
import { Obj } from '../../../utils/index.js';
import { Base } from '../../base/index.js';

const TITLES = {
  ancestor: 'WordPress Block Ancestor',
  attributes: 'WordPress Block Attributes',
  deprecated: 'WordPress Block Deprecated',
  example: 'WordPress Block Example',
  icon: 'WordPress Block Icon',
  keywords: 'WordPress Block Keywords',
  parent: 'WordPress Block Parent',
  providesContext: 'WordPress Block Provides Context',
  render: 'WordPress Block Render',
  styles: 'WordPress Block Styles',
  supports: 'WordPress Block Supports',
  transforms: 'WordPress Block Transforms',
  usesContext: 'WordPress Block Uses Context',
  editorScript: 'WordPress Block Editor Script',
  editorStyle: 'WordPress Block Editor Style',
  style: 'WordPress Block Style',
  viewScriptModule: 'WordPress Block View Script Module',
  script: '<<VOID>>',
  viewScript: '<<VOID>>'
} as const;
/**
 * https://developer.wordpress.org/block-editor/getting-started/fundamentals/block-json/#files-for-the-blocks-behavior-output-or-style
 */
const FILES = {
  /**
   * @deprecated - WordPress scripts and WordPress script modules are not compatible at the moment. This library is designed for modern WordPress development.
   *
   * 1. Modern interactive blocks should use 'viewScriptModule' instead, which is designed
   *    for the WordPress Interactivity API and supports ES modules
   *
   * 2. Using both 'viewScript' and 'viewScriptModule' can cause conflicts and redundant loading
   *
   * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script-module} for viewScriptModule documentation
   */
  // viewScript: null;
  /**
   * @deprecated - WordPress scripts and WordPress script modules are not compatible at the moment. This library is designed for modern WordPress development.
   *
   * 1. Modern interactive blocks should use 'viewScriptModule' instead, which is designed
   *    for the WordPress Interactivity API and supports ES modules
   *
   * 2. Using both 'script' and 'viewScriptModule' can cause conflicts and redundant loading
   *
   * 3. The block is explicitly configured with 'supports: \{ interactivity: true \}', to follow more modern wordpress development patterns
   *
   * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script-module} for viewScriptModule documentation
   * @see {@link https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/} for Interactivity API documentation
   *
   *
   */
  // script?: null;
  /**
   * [Block type editor script definition. It will only be enqueued in the context of the editor.](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#editor-script)
   */
  editorScript: 'file:./index.js',
  /**
   * [Block type editor style definition. It will only be enqueued in the context of the editor](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#editor-style)
   */
  editorStyle: 'file:./index.css',
  /**
   * [Block type editor style definition. It will only be enqueued in the context of the editor.](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#style)
   */
  style: 'file:./styles.css',
  /**
   * [path to a PHP template file responsible for generating a dynamically rendered block’s front-end markup](https://developer.wordpress.org/block-editor/getting-started/fundamentals/block-json/#files-for-the-blocks-behavior-output-or-style)
   */
  render: 'file:./render.php',
  /**
   * [Block type frontend script module definition](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script-module)
   */
  viewScriptModule: 'file:./view.js'
} as const;
export type BlockFiles = typeof FILES;
/**
 * Enforces interactivity support
 */
export interface ExtendedBlockSupports extends Partial<WpBlocks.BlockSupports> {
  interactivity?: true;
}
/**
 * Properties that are not used in block configuration
 */
export type OmittedProps = Pick<
  WpBlocks.BlockConfiguration,
  // Runtime functions
  | 'save'
  | 'edit'
  | 'getEditWrapperProps'
  | 'merge'
  // Deprecated
  // | 'viewScript'
  | 'script'
  | 'deprecated'
  | 'transforms'
>;

export interface Static extends BlockFiles {
  readonly version: typeof VERSIONS.base;
  readonly apiVersion: typeof VERSIONS.wpBlockApi;
}
/** Modified WordPress block configuration type */
export type Resolved = Required<
  Omit<WpBlocks.BlockConfiguration, keyof OmittedProps | keyof Static | 'icon'>
    & Static & {
      namespace: string;
      slug: string;
      supports: ExtendedBlockSupports;
      icon: WpBlocks.BlockIcon & string;
    }
>;
export type CoreBlockCategory =
  | 'text'
  | 'media'
  | 'design'
  | 'widgets'
  | 'theme'
  | 'embed';
export type Types = Base.CreateConfigTypes<
  Resolved,
  Static,
  'namespace' | 'slug' | 'title'
> & { coreCategory: CoreBlockCategory };

const validateResolvedName = (name: unknown) => {
  const blName = `Block Name`;
  const stringResult = Validator.string(name, blName, {
    allowEmpty: false,
    bounds: {
      min: LIMITS.min.namespace + LIMITS.min.slug + 1 // for the slash
    }
  });
  if (!stringResult.value) return stringResult;
  const [ns, slug] = stringResult.value.split('/');
  if (!ns || !slug) {
    return Validator.Result.invalid(
      name,
      blName,
      Validator.Msgs.mustBe._(
        'a string with a single forward slash. eg namespace/slug'
      )
    );
  }
  const nsResult = Validator.string(ns, 'namespace part of block name', {
    allowEmpty: false,
    bounds: { min: LIMITS.min.namespace }
  });
  if (!nsResult.value) return nsResult;
  /**
   * If the name has the correct length with a valid namespace the slug must have a valid length.
   */
  return stringResult;
};

export const { data, ops } = Base.createConfigModule<
  Types['resolved'],
  Types['static'],
  Types['keys']['requiredInput']
>({
  moduleName: 'wordpress-block',
  _static: {
    version: VERSIONS.base,
    apiVersion: VERSIONS.wpBlockApi,
    ...FILES
  },
  requiredPropKeys: ['namespace', 'slug', 'title'],
  defaults: {
    supports: {
      interactivity: true,
      align: true,
      anchor: true,
      className: true,
      customClassName: true,
      html: false,
      inserter: true,
      multiple: false,
      reusable: false,
      color: { background: true, text: true, link: true },
      spacing: { blockGap: true, margin: true, padding: true }
    },
    icon: 'block-default',
    category: 'widgets',
    description: '',
    ancestor: [],
    keywords: [],
    example: {},
    parent: [],
    providesContext: {},
    styles: [],
    usesContext: [],
    attributes: {
      content: { type: 'string', default: '' },
      alignment: { type: 'string', default: 'left' },
      backgroundColor: { type: 'string', default: '#ffffff' },
      showDetails: { type: 'boolean', default: false }
    },
    name: '',
    textdomain: ''
  },
  validators: {
    version: Validator.Generic.create((v) => v === VERSIONS.base),
    namespace: (v: unknown) =>
      Validator.string(v, 'Namespace', {
        allowEmpty: false,
        bounds: { min: LIMITS.min.namespace }
      }),
    slug: (v: unknown) =>
      Validator.string(v, 'Slug', {
        allowEmpty: false,
        bounds: { min: LIMITS.min.slug }
      }),
    title: (v: unknown) => Validator.string(v, 'Title', { allowEmpty: false }),
    name: validateResolvedName,
    keywords: Validator.Arr.create(
      (v) => Validator.string(v, TITLES.keywords),
      { allowEmpty: true }
    ),
    supports: Validator.Generic.create(
      (v) =>
        Obj.is<ExtendedBlockSupports>(v, ['interactivity']) && !!v.interactivity
    ),
    apiVersion: (v: unknown) =>
      v === VERSIONS.wpBlockApi ?
        Validator.Result.valid(v, 'WordPress Block API Version')
      : Validator.Result.invalid(v, 'WordPress Block API Version'),
    ancestor: Validator.Arr.create(
      (v) =>
        Validator.string(v, TITLES.ancestor, {
          allowEmpty: false,
          bounds: { min: LIMITS.min.namespace + LIMITS.min.slug + 1 },
          shouldPass: () => validateResolvedName(v).value !== null
        }),
      { allowEmpty: true }
    ),

    attributes: Validator.Generic.obj,
    category: Validator.Generic.str,
    example: Validator.Generic.obj,
    icon: Validator.Generic.str<WpBlocks.BlockIcon & string>,
    parent: Validator.Generic.obj,
    description: Validator.Generic.str,
    providesContext: Validator.Generic.obj,
    render: Validator.Generic.str,
    styles: Validator.Arr.create(
      (v) => Validator.Generic.obj(v, TITLES.styles),
      { allowEmpty: true }
    ),
    usesContext: Validator.Generic.obj,
    editorScript: Validator.Generic.str,
    editorStyle: Validator.Generic.str,
    style: Validator.Generic.str,
    viewScriptModule: Validator.Generic.str,
    textdomain: Validator.Generic.str
  },
  inputResolveHelper: ({ slug, namespace, supports, ...rest }) => ({
    ...rest,
    name: `${namespace}/${slug}`,
    textdomain: slug,
    supports: { ...supports, interactivity: true }
  })
});
