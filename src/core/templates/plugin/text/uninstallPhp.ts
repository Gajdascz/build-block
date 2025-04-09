import type { ConfiguredTemplate } from '#config';

const create = (): ConfiguredTemplate => ({
  filename: 'uninstall.php',
  generate: ({
    core: { slug, title, namespace },
    php: { classScope }
  }) => `<?php
/**
 * Uninstall ${title}
 *
 * This file runs when the plugin is uninstalled.
 * 
 * @package ${slug}
 */

// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Define constants for use in uninstall process
define( '${namespace.toUpperCase()}_REMOVING', true );
define( '${namespace.toUpperCase()}_VERSION', '1.0.0' );

/**
 * Removes all plugin data and settings
 */
function ${classScope}_uninstall() {
    // Remove plugin options from options table
    delete_option( '${slug}_settings' );
    
    // Delete any plugin transients
    delete_transient( '${slug}_transient' );
    
    // Clear any scheduled cron events
    wp_clear_scheduled_hook( '${slug}_cron_event' );
    
    // For multisite installations
    // if ( is_multisite() ) {
        // Get all blogs in the network
        // $site_ids = get_sites( [ 'fields' => 'ids', 'number' => 0 ] );
        
        // foreach ( $site_ids as $site_id ) {
            // switch_to_blog( $site_id );
            
            // Perform site-specific cleanup
            // delete_option( '${slug}_settings' );
            // delete_transient( '${slug}_transient' );
            
            // restore_current_blog();
        // }
    // }
    
    // Optionally, remove custom database tables
    // global $wpdb;
    // $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}${slug}_table" );
    
    // Clear any plugin cache
    if ( function_exists( 'wp_cache_flush' ) ) {
        wp_cache_flush();
    }
}

// Run the uninstaller
${classScope}_uninstall();
`
});

export { create };
