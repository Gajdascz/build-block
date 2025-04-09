import * as json from './json/index.js';
import * as text from './text/index.js';

export const load = (pluginSlug: string) =>
  [...json.load(), ...text.load(pluginSlug)] as const;
