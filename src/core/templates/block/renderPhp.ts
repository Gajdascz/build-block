import type { ConfiguredTemplate } from '#config';
const create = (): ConfiguredTemplate => ({
  filename: 'render.php',
  relativePath: 'src',
  generate: ({ core: { namespace, slug, title } }) => `
<?php
/**
 * block.json.render
 * 
 * Defines the server-side process that returns the markup for the block 
 * when there is a request from the front end. If 
 * defined, this file will take precedence over other ways to 
 * render the block’s markup on the front end.
 */

// Validate & Sanitize block attributes
$attributes = isset($block->attributes) ? $block->attributes : [];
if(!isset($namespace) || empty ($namespace)) {
	throw new Exception('Namespace is required but not provided.');
} else $namespace = sanitize_key($namespace);
if(!isset($slug) || empty ($slug)) {
	throw new Exception('Slug is required but not provided.');
} else $slug = sanitize_key($slug);
if(!isset($title)) {
	throw new Exception('Title is required but not provided.');
} else $title = sanitize_title($title);

// Generates a unique id for aria-controls.
$unique_id = wp_unique_id( prefix: 'p-' );
// Adds the global state.
wp_interactivity_state(
	store_namespace: '${namespace}',
	state: [
		'example'   => esc_html__( text: 'Dark Text', domain:'${slug}' ),
		'darkText'  => esc_html__( text: 'Dark Text', domain:'${slug}' ),
		'lightText' => esc_html__( text: 'Light Text', domain:'${slug}' ),
		'themeText'	=> esc_html__( text: 'Dark Text', domain:'${slug}' ),
	]
);
?>

<div
	<?php echo esc_attr( get_block_wrapper_attributes() ); ?>
	data-wp-interactive= "<?php echo esc_attr( namespace: '${namespace}' ); ?>"
	<?php echo esc_attr( wp_interactivity_data_wp_context( context: array( 'isOpen' => false ) ) ); ?>
	data-wp-watch="<?php echo esc_attr( 'callbacks.logIsOpen' ); ?>"
	data-wp-class--dark-theme="<?php echo esc_attr( 'state.isDark' ); ?>"
>
	<button
			data-wp-on--click="<?php echo esc_attr( 'actions.toggleTheme' ); ?>"
			data-wp-text="<?php echo esc_attr( 'state.themeText' ); ?>"
	></button>

	<button
      data-wp-on--click="<?php echo esc_attr( 'actions.toggleOpen' ); ?>"
      data-wp-bind--aria-expanded="<?php echo esc_attr( 'context.isOpen' ); ?>"
      aria-controls="<?php echo esc_attr( $unique_id ); ?>"
	>
		<?php esc_html_e( text: 'Toggle', domain:'${slug}'); ?>
	</button>

	<p
		id="<?php echo esc_attr( text: $unique_id ); ?>"
		data-wp-bind--hidden="<?php echo esc_attr( '!context.isOpen' ); ?>"
	>
		<?php
			esc_html_e( text: '<${title}> - hello from  renderPhp!', domain:'${slug}' );
		?>
	</p>
</div>`
});
export { create };
