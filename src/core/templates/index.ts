import * as block from './block/index.js';
import * as plugin from './plugin/index.js';

export const load = (pluginSlug: string) =>
  [...block.load(), ...plugin.load(pluginSlug)] as const;
