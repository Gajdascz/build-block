import * as edit from './edit.js';
import * as json from './json.js';
import * as readme from './readme.js';
import * as registerIndex from './registerIndex.js';
import * as renderPhp from './renderPhp.js';
import * as view from './view.js';

export const load = () =>
  [
    edit.create(),
    json.create(),
    readme.create(),
    registerIndex.create(),
    renderPhp.create(),
    view.create()
  ] as const;
