import path from 'path';
import { Obj } from '../utils/index.js';

interface ResultObj<T> {
  result: T | null;
  error?: string;
}

interface Template<Config extends object = object> {
  filename: string;
  generate: (cfg: Config, ...args: any[]) => string;
  relativePath?: string;
}

/**
 * JSON Schema URLs for configuration files.
 */
const JSON_SCHEMAS = {
  block: 'https://schemas.wp.org/trunk/block.json',
  prettier: 'https://json.schemastore.org/prettierrc',
  package: 'https://json.schemastore.org/package.json',
  babel: 'https://json.schemastore.org/babelrc',
  composer: 'https://getcomposer.org/schema.json',
  stylelint: 'https://json.schemastore.org/stylelintrc.json',
  tsconfig: 'https://json.schemastore.org/tsconfig.json',
  tsdoc:
    'https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json'
} as const;
/**
 * Limits for configuration properties.
 */
const LIMITS = {
  min: {
    /**
     * [In order to prevent conflicts with other plugins, your prefix should be at least 4 letters long, though we recommend 5. You should avoid using a common English word, and instead choose something unique to your plugin.](https://developer.wordpress.org/plugins/plugin-basics/best-practices/#avoid-naming-collisions)
     */
    namespace: 5,
    slug: 5,
    title: 5
  },
  max: { description: 150, wpTags: 5 }
} as const;

/** Versions found throughout the plugin and generated project. */
const VERSIONS = {
  cli: '0.0.0',

  base: '0.0.0',
  /** [WordPress Platform](https://wordpress.org/news/category/releases/) */
  wp: '6.7.0',
  /** [PHP](https://www.php.net/supported-versions.php) */
  php: '8.0.0',
  /** [WordPress Block API](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-api-versions/) */
  wpBlockApi: 3,
  /** package.json */
  package: {
    /** Plugin dependencies */
    dependencies: {
      /**
       * [React is a JavaScript library for creating user interfaces.
The react package contains only the functionality necessary to define React components. It is typically used together with a React renderer like react-dom for the web, or react-native for the native environments.](https://www.npmjs.com/package/react)
       */
      react: '^18.2.0',
      /**
       * [This package serves as the entry point to the DOM and server renderers for React. It is intended to be paired with the generic React package, which is shipped as react to npm.](https://www.npmjs.com/package/react-dom)
       */
      'react-dom': '^18.2.0',
      /**
       * [This module allows you to create and use standalone block editors.](https://www.npmjs.com/package/\@wordpress/block-editor)
       */
      '@wordpress/block-editor': '^14.15.0',
      /**
       * ["Block" is the abstract term used to describe units of markup that, composed together, form the content or layout of a webpage. The idea combines concepts of what in WordPress today we achieve with shortcodes, custom HTML, and embed discovery into a single consistent API and user experience.](https://www.npmjs.com/package/\@wordpress/blocks)
       */
      '@wordpress/blocks': '^12.35.0',
      /**
       * [This package includes a library of generic WordPress components to be used for creating common UI elements shared between screens and features of the WordPress dashboard.](https://www.npmjs.com/package/\@wordpress/components)
       */
      '@wordpress/components': '^29.6.0',
      /**
       * [Element is a package that builds on top of React and provide a set of utilities to work with React components and React elements.](https://www.npmjs.com/package/\@wordpress/element)
       */
      '@wordpress/element': '^6.20.0',
      /**
       * [Internationalization utilities for client-side localization.](https://www.npmjs.com/package/\@wordpress/i18n)
       */
      '@wordpress/i18n': '^5.20.0',
      /**
       * [WordPress Icons Library.](https://www.npmjs.com/package/\@wordpress/icons)
       */
      '@wordpress/icons': '^10.20.0',
      /**
       * [The package \@wordpress/interactivity contains the logic that enables the Interactivity API which was introduced in WordPress Core in v6.5. This means this package is already bundled in Core in any version of WordPress higher than v6.5.
Check the Interactivity API Reference docs in the Block Editor handbook to learn more about the Interactivity API. ](https://www.npmjs.com/package/\@wordpress/interactivity)
       */
      '@wordpress/interactivity': '^6.20.0'
    },
    devDependencies: {
      vitest: '^3.0.9',
      '@vitest/coverage-v8': '3.0.9',
      typescript: '^5.8.2',
      prettier: '^3.5.3',
      '@wordpress/eslint-plugin': '^22.6.0',
      '@wordpress/scripts': '^30.13.0',
      '@wordpress/stylelint-config': '^23.12.0',

      '@babel/preset-env': '^7.26.9',

      //eslint
      eslint: '^9.23.0',
      'typescript-eslint': '^8.27.0',
      '@eslint/js': '^9.23.0',
      'eslint-plugin-import': '^2.31.0',
      'eslint-plugin-tsdoc': '^0.4.0',
      'eslint-config-prettier': '^10.1.1',
      'eslint-import-resolver-typescript': '^4.2.2',
      /**
       * [This repository contains the legacy ESLintRC configuration file format for ESLint. This package is not intended for use outside of the ESLint ecosystem. It is ESLint-specific and not intended for use in other programs.](https://www.npmjs.com/package/\@eslint/eslintrc)
       */
      '@eslint/eslintrc': '^3.3.1',
      // @types
      '@types/react': '^19.0.12',
      '@types/react-dom': '^19.0.4',
      '@types/wordpress__block-editor': '^11.5.16',
      '@types/wordpress__blocks': '^12.5.17'
    },
    packageManager: 'pnpm@10.6.5'
  }
} as const;
/**
 * License information.
 */
const LICENSE = {
  type: 'GPLv2+',
  url: 'https://www.gnu.org/licenses/gpl-2.0.html'
} as const;

interface SupportedExtensions {
  json: 'json';
  ts: 'ts';
  js: 'js';
}
type SupportedExtension = keyof SupportedExtensions;
const SUPPORTED_EXTS: {
  map: SupportedExtensions;
  arr: SupportedExtension[];
  is: (ext: unknown) => ext is SupportedExtension;
  has: (str: unknown) => str is `${string}.${keyof SupportedExtensions}`;
  toString: () => string;
} = {
  map: { json: 'json', ts: 'ts', js: 'js' },
  arr: [],
  is: (ext: unknown): ext is SupportedExtension =>
    typeof ext === 'string' && ext in SUPPORTED_EXTS.map,
  has: (str: unknown): str is `${string}.${SupportedExtension}` =>
    typeof str === 'string'
    && str.includes('.')
    && !str.startsWith('.')
    && path.extname(str).slice(1).toLowerCase() in SUPPORTED_EXTS.map,
  toString: () => SUPPORTED_EXTS.arr.join(', ')
} as const;
SUPPORTED_EXTS.arr.push(
  ...(Object.values(SUPPORTED_EXTS.map) as (keyof SupportedExtensions)[])
);
const EXIT_CODES = {
  success: 0,
  error: 1,
  invalidConfig: 2,
  cancelled: 3
} as const;

const INPUT_CONFIG_PROVIDER_TYPES = {
  prompts: 'prompts',
  filePath: 'filePath'
} as const;
type InputConfigProviderType = keyof typeof INPUT_CONFIG_PROVIDER_TYPES;

const isConstant = {
  configInputProvider: (val: unknown): val is InputConfigProviderType =>
    typeof val === 'string' && val in INPUT_CONFIG_PROVIDER_TYPES,
  license: (value: unknown): value is typeof LICENSE =>
    Obj.is(value, ['type', 'url'])
    && value.type === LICENSE.type
    && value.url === LICENSE.url,
  version: {
    base: (value: unknown): value is typeof VERSIONS.base =>
      value === VERSIONS.base,
    wp: (value: unknown): value is typeof VERSIONS.wp => value === VERSIONS.wp,
    php: (value: unknown): value is typeof VERSIONS.php =>
      value === VERSIONS.php,
    wpBlockApi: (value: unknown): value is typeof VERSIONS.wpBlockApi =>
      value === VERSIONS.wpBlockApi
  }
} as const;

const CFG_SLUG = 'build-block';
const getCwdWithSlug = () => path.resolve(`${process.cwd()}/${CFG_SLUG}`);

export {
  type InputConfigProviderType,
  type ResultObj,
  type SupportedExtension,
  type SupportedExtensions,
  type Template,
  CFG_SLUG,
  EXIT_CODES,
  getCwdWithSlug,
  INPUT_CONFIG_PROVIDER_TYPES,
  isConstant,
  JSON_SCHEMAS,
  LICENSE,
  LIMITS,
  SUPPORTED_EXTS,
  VERSIONS
};
