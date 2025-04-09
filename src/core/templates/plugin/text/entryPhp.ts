import type { ConfiguredTemplate } from '#config';
const create = (filename: string): ConfiguredTemplate => ({
  filename: `${filename}.php`,
  generate: ({
    core: {
      slug,
      authorName,
      authorUrl,
      description,
      license,
      title,
      version,
      repository
    },
    npm: {
      contributors: npmContributors,
      name: npmName,
      keywords: npmKeywords,
      url: npmUrl
    },
    wp: {
      requiresPlugins: wpRequiresPlugins,
      updateUrl: wpUpdateUrl,
      version: wpVersion
    },
    php: { classScope, version: phpVersion }
  }) => `<?php
/**
 * ${title}
 *
 * @package           ${npmName}
 * @author            ${authorName}
 * @copyright         2025 ${authorName}
 * @license           ${license.type}
 *
 * @wordpress-plugin
 * Plugin Name:       ${title}
 * Plugin URL:        ${repository}
 * Description:       ${description}
 * Version:           ${version}
 * Requires at least: ${wpVersion}
 * Requires PHP:      ${phpVersion}
 * Author:            ${authorName}
 * Author URL:        ${authorUrl}
 * Text Domain:       ${slug}
 * License:           ${license.type}
 * License URL:       ${license.url}
 * Update URL:        ${wpUpdateUrl}
 * Requires Plugins:  ${wpRequiresPlugins.join()}
 * 
 * @npm-package
 * Name:              ${npmName}
 * Version:           ${version}
 * URL:               ${npmUrl}
 * Keywords:          ${npmKeywords.join()}
 * Contributors:      ${npmContributors
   .map((contributor) =>
     contributor.url ?
       `[${contributor.name}](${contributor.url})`
     : contributor.name
   )
   .join(', ')}
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
if ( ! class_exists( '${classScope}_Plugin' ) ) {
  class ${classScope}_Plugin {
    /**
     * Initialize the plugin
     * 
     * @return void
     */
    public static function init() {
      /**
       * Registers the block using the metadata loaded from the \`block.json\` file.
       * Behind the scenes, it registers also all assets so they can be enqueued
       * through the block editor in the corresponding context.
       *
       * @see https://developer.wordpress.org/reference/functions/register_block_type/
       */
      register_block_type_from_metadata( __DIR__ . '/build' );
    }
  }
  
  // Register the initialization method
  add_action( 'init', ['${classScope}_Plugin' => 'init' ] );
}
`
});

export { create };
