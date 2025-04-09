import { inputKeyMap } from '#config';
import type prompts from 'prompts';
import {
  createGroupManager,
  createPrompt,
  createStringArrayPrompt
} from '../utils/index.js';

const names = inputKeyMap.wp;
type Names = typeof names;
type PromptMap = { [K in keyof Names]: prompts.PromptObject<K> };

const MODULE_NAME = 'wp';
const defs: PromptMap = {
  contributors: createStringArrayPrompt(
    names.contributors,
    'WpUser1,WpUser2...',
    'Enter the wp contributors',
    { module: MODULE_NAME, prop: names.contributors }
  ),
  requiresPlugins: createStringArrayPrompt(
    names.requiresPlugins,
    'Plugin1,Plugin2...',
    'Enter the wp requires plugins in a comma separated string',
    { module: MODULE_NAME, prop: names.requiresPlugins }
  ),
  tags: createStringArrayPrompt(
    names.tags,
    'block,plugin',
    'Enter the wp tags in a comma separated string',
    { module: MODULE_NAME, prop: names.tags }
  ),
  updateUrl: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.updateUrl,
    message: 'Enter the wp update url'
  })
} as const;
const group = createGroupManager({
  slug: 'wp-core',
  prompts: { all: { ...defs } },
  details: { icon: '🔵', title: 'WordPress Core' }
});

export { type Names, type PromptMap, defs, group, names };
