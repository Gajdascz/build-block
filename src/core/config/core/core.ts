import { isConstant, LICENSE, LIMITS, VERSIONS } from '#constants';
import path from 'path';
import { slugify } from '../../utils/index.js';
import { Validator } from '../../validator/index.js';
import { Base } from '../base/index.js';
const TITLES = {
  outputDirectory: 'Output Directory',
  author: 'Author',
  authorName: 'Author Name',
  authorEmail: 'Author Email',
  authorUrl: 'Author URL',
  license: 'License',
  licenseType: 'License Type',
  licenseUrl: 'License URL',
  description: 'Description',
  namespace: 'Namespace',
  slug: 'Slug',
  title: 'Title',
  version: 'Version',
  category: 'Category',
  funding: 'Funding',
  repository: 'Repository'
} as const;

export interface Static {
  readonly version: typeof VERSIONS.base;
  readonly license: typeof LICENSE;
}
export interface Resolved extends Static {
  /**
   * Where the plugin will be built.
   * Final location must be the same as the slug name.
   */
  outputDirectory: string;
  /**
   * [Block Specific Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/block-specific-plugin-guidelines/#block-plugins-and-the-block-directory)
   *
   * This template uses the namespace and slug configuration properties to
   * generate the full block name. The namespace may not be a reserved one
   * such as core or wordpress.
   *
   * Provided values are always coerced to slugs.
   *
   * 3a. Block names should be unique and properly namespaced.
   * The block name (meaning the name parameter to registerBlockType() and name in
   * block.json) must be unique to the block. As with titles, please respect
   * trademarks and other projects' commonly used names, so as not
   * to conflict with them.
   *
   * The namespace prefix to the block name should reflect either the plugin author,
   * or the plugin slug. For example:
   * - name: "my-rainbow-block-plugin/rainbow"
   * - name: "john-doe/rainbow"
   * - name: "pluginco/rainbow"
   *
   * Found in:
   * - block.json name property  (eg. `{{namespace}}/{{slug}}`)
   * - wordpress Interactivity API store and directive namespace
   * - php class and method scope defaults (transformed respectively)
   */
  namespace: string;
  /**
   * Block and Plugin primary identifier.
   * Found in:
   * - The block:
   *   - name excluding the namespace (eg. `.../{{slug}}`)
   *   - [textdomain for wp i18n](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#text-domains)
   * - The plugin:
   *   - identifier and directory name
   *   - php entry file name (eg. `{{slug}}.php`)
   *   - npm package name (eg. `@{{scopes.package}}/{{slug}}`)
   */
  slug: string;
  /**
   * [Block Specific Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/block-specific-plugin-guidelines/#block-plugins-and-the-block-directory)
   *
   * 3. Plugin Titles and Block Titles
   * Plugin titles and block titles should describe what the block
   * does in a way that helps users easily understand its purpose. In
   * most cases the plugin title and the block title should be
   * identical or very similar.
   *
   * - Examples of good plugin and block titles:
   *   - Rainbow Block
   *   - Sepia Image Grid
   *   - Business Hours Block
   *
   * - Found in:
   *   - block.json title property
   *   - plugin entry php file header (eg. `Plugin Name: {{title}}`)
   *   - plugin readme.txt (eg. `=== {{title}} ===`)
   */
  title: string;
  /** Short (&lt;150 words) description of the plugin/block */
  description: string;
  /** Project executive */
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  /** Development repository url */
  repository: string;
  /** Link to donate */
  funding: string;
}
export type Types = Base.CreateConfigTypes<
  Resolved,
  Static,
  'namespace' | 'slug' | 'title' | 'description'
>;
export const { data, ops } = Base.createConfigModule<
  Types['resolved'],
  Types['static'],
  Types['keys']['requiredInput']
>({
  moduleName: 'core' as const,
  defaults: {
    outputDirectory: process.cwd(),
    authorName: '',
    authorEmail: '',
    authorUrl: '',
    funding: '',
    repository: ''
  },
  _static: { version: VERSIONS.base, license: LICENSE },
  requiredPropKeys: ['namespace', 'slug', 'title'],
  validators: {
    outputDirectory: (v: unknown) =>
      Validator.string(v, TITLES.outputDirectory, { allowEmpty: false }),
    license: Validator.Generic.create(isConstant.license),
    version: Validator.Generic.create(isConstant.version.base),
    authorName: (v: unknown) =>
      Validator.string(v, TITLES.authorName, { allowEmpty: true }),
    authorEmail: (v: unknown) =>
      Validator.string(v, TITLES.authorEmail, { allowEmpty: true }),
    authorUrl: (v: unknown) =>
      Validator.string(v, TITLES.authorUrl, { allowEmpty: true }),
    slug: (v: unknown) =>
      Validator.string(v, TITLES.slug, { bounds: { min: LIMITS.min.slug } }),
    namespace: (v: unknown) =>
      Validator.string(v, TITLES.namespace, {
        bounds: { min: LIMITS.min.namespace }
      }),
    title: (v: unknown) =>
      Validator.string(v, TITLES.title, { bounds: { min: LIMITS.min.title } }),
    repository: (v: unknown) =>
      Validator.string(v, TITLES.repository, { allowEmpty: true }),
    funding: (v: unknown) =>
      Validator.string(v, TITLES.funding, { allowEmpty: true }),
    description: (v: unknown) =>
      Validator.string(v, TITLES.description, {
        bounds: { max: LIMITS.max.description }
      })
  },
  inputResolveHelper: ({ namespace, slug, outputDirectory, ...rest }) => {
    const _slug = slugify(slug);
    const ns = slugify(namespace);
    let baseDir =
      outputDirectory ? path.resolve(outputDirectory) : process.cwd();
    const baseName = path.basename(baseDir);
    if (baseName !== _slug) baseDir = path.join(baseDir, _slug);

    return {
      ...rest,
      slug: _slug,
      namespace: ns,
      outputDirectory: baseDir,
      name: `${ns}/${_slug}`
    };
  }
} as const);
