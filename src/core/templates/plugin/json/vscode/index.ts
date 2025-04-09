import * as extensions from './extensions.js';
import * as launch from './launch.js';
import * as settings from './settings.js';

export const load = () =>
  [extensions.create(), launch.create(), settings.create()] as const;
