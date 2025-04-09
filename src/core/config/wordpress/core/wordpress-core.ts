import { LIMITS, VERSIONS } from '#constants';
import { Validator } from '#validator';
import { Base } from '../../base/index.js';

const TITLES = {
  version: 'WordPress Version',
  contributors: 'WordPress Contributors',
  tags: 'WordPress Tags',
  updateUrl: 'WordPress Update URL',
  requiresPlugins: 'Requires Plugins'
} as const;

export interface Static {
  readonly version: typeof VERSIONS.wp;
}
export interface Resolved extends Static {
  /**
   * [Contributors – a case sensitive, comma separated list of all WordPress.org
   * usernames who have contributed to the code.](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/#readme-header-information)
   */
  contributors: string[];
  /** [Tags – an array of at most 5 plugin keywords](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/#readme-header-information) */
  tags: string[];
  /** Allows third-party plugins to avoid accidentally being overwritten with an update of a plugin of a similar name from the WordPress.org Plugin Director */
  updateUrl: string;
  /** WordPress.org-formatted slugs for its dependencies */
  requiresPlugins: string[];
}
export type Types = Base.CreateConfigTypes<Resolved, Static, never>;
export const { data, ops } = Base.createConfigModule<
  Types['resolved'],
  Types['static'],
  Types['keys']['requiredInput']
>({
  moduleName: 'wordpress-core',
  _static: {
    /** https://wordpress.org/download/releases/ */
    version: VERSIONS.wp
  } as const,
  defaults: { contributors: [], tags: [], updateUrl: '', requiresPlugins: [] },
  validators: {
    contributors: Validator.Arr.create(Validator.string, { allowEmpty: true }),
    tags: Validator.Arr.create(Validator.string, {
      allowEmpty: true,
      bounds: { max: LIMITS.max.wpTags }
    }),
    updateUrl: (v) =>
      Validator.string(v, TITLES.updateUrl, { allowEmpty: true }),
    requiresPlugins: Validator.Arr.create(Validator.string, {
      allowEmpty: true
    }),
    version: Validator.Generic.create((v) => v === VERSIONS.wp)
  },
  requiredPropKeys: []
});
