import { VERSIONS } from '#constants';
import { Validator } from '../../validator/index.js';
import { Base } from '../base/index.js';

const TITLES = {
  name: 'Name',
  url: 'URL',
  version: 'Version',
  contributors: 'Contributors',
  keywords: 'keywords'
} as const;

export interface Static {
  readonly version: typeof VERSIONS.base;
}
export interface Resolved extends Static {
  /** [The full npm package name](https://docs.npmjs.com/cli/v11/configurlng-npm/package-json#name) */
  name: string;
  /** NPM package page */
  url: string;
  /** [Contributors –   an array of people. A "person" is an object with a "name" field and optionally "url" and "email"](https://docs.npmjs.com/cli/v11/configurlng-npm/package-json#people-fields-author-contributors) */
  contributors: Validator.Types.Person[];
  /** [keywords – helps people discover the package as it's listed in npm search](https://docs.npmjs.com/cli/v11/configurlng-npm/package-json#keywords) */
  keywords: string[];
}
export type Types = Base.CreateConfigTypes<Resolved, Static, 'name'>;
export const { data, ops } = Base.createConfigModule<
  Types['resolved'],
  Types['static'],
  Types['keys']['requiredInput']
>({
  moduleName: 'npm',
  _static: { version: VERSIONS.base },
  defaults: { url: '', contributors: [], keywords: [] },
  requiredPropKeys: ['name'],
  validators: {
    version: Validator.Generic.create((v) => v === VERSIONS.base),
    name: (v) => Validator.string(v, TITLES.name),
    url: (v) => Validator.string(v, TITLES.url, { allowEmpty: true }),
    keywords: Validator.Arr.create(Validator.string, { allowEmpty: true }),
    contributors: Validator.Arr.create(
      (v) =>
        Validator.Person.full(v, TITLES.contributors, {
          allowEmpty: { all: true }
        }),
      { allowEmpty: true }
    )
  }
});
