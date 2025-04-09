import { LIMITS, VERSIONS } from '#constants';
import { Validator } from '../../validator/index.js';
import { Base } from '../base/index.js';

const TITLES = {
  classScope: `PHP Class Scope`,
  methodScope: 'PHP Method Scope',
  version: 'PHP Version'
} as const;

export interface Static {
  /** https://www.php.net/supported-versions.php */
  readonly version: typeof VERSIONS.php;
}
export interface Resolved extends Static {
  /**
   * Unique namespace for the plugin in the WordPress plugin directory.
   * [This template uses the Object Oriented Approach](https://developer.wordpress.org/plugins/plugin-basics/best-practices/#object-oriented-programming-method)
   *
   * @example
   * ```php
   * if ( ! class_exists( '{{phpScopes.class}}_Plugin' ) ) {
   * class {{phpScopes.class}}_Plugin {
   *     public static function init() {
   *         register_setting( '{{phpScopes.method}}_settings', '{{phpScopes.method}}_option_foo' );
   *     }
   *     public static function get_foo() {
   *         return get_option( '{{phpScopes.method}}_option_foo' );
   *     }
   * }
   * }
   *
   * {{phpScopes.class}}_Plugin::init();
   * {{phpScopes.class}}_Plugin::get_foo();
   * ```
   */
  classScope: string;
  /**
   * The unique method scope for the plugin.
   *
   * Used to prevent method name conflicts in the global wordpress environment.
   *
   * @example
   * ```php
   * class {{phpScopes.class}}_Plugin {
   *     public static function init() {
   *         register_setting( '{{phpScopes.method}}_settings', '{{phpScopes.method}}_option_foo' );
   *     }
   *     public static function get_foo() {
   *         return get_option( '{{phpScopes.method}}_option_foo' );
   *     }
   * ```
   */
  methodScope: string;
}
export type Types = Base.CreateConfigTypes<
  Resolved,
  Static,
  'classScope' | 'methodScope'
>;
export const { data, ops } = Base.createConfigModule<
  Types['resolved'],
  Types['static'],
  Types['keys']['requiredInput']
>({
  moduleName: 'php',
  _static: { version: VERSIONS.php },
  defaults: {},
  requiredPropKeys: [],
  validators: {
    version: Validator.Generic.create((v) => v === VERSIONS.php),
    classScope: (v: unknown) =>
      Validator.string(v, TITLES.classScope, {
        bounds: { min: LIMITS.min.namespace }
      }),
    methodScope: (v: unknown) =>
      Validator.string(v, TITLES.version, {
        bounds: { min: LIMITS.min.namespace }
      })
  }
});
