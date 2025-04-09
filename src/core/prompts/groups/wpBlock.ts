import { inputKeyMap } from '#config';
import type prompts from 'prompts';
import {
  createGroupManager,
  createPrompt,
  createStringArrayPrompt
} from '../utils/index.js';

const MODULE_NAME = 'block';
const names = inputKeyMap.block;
type Names = typeof names;

type PromptMap = {
  [K in keyof Pick<
    Names,
    'category' | 'icon' | 'keywords'
  >]: prompts.PromptObject<K>;
};
const defs: PromptMap = {
  category: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.category,
    message:
      "Enter the block's category. Core include:[design,text,media,widgets,embed,theme]"
  }),
  icon: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.icon,
    message: 'Enter the block icon'
  }),
  keywords: createStringArrayPrompt(
    names.keywords,
    'block,plugin',
    'Enter the block keywords in a comma separated string',
    { module: MODULE_NAME, prop: names.keywords }
  )
} as const;

const group = createGroupManager({
  slug: 'block',
  prompts: { all: { ...defs } },
  details: { icon: '🟪', title: 'WordPress Block' }
});
export { type Names, type PromptMap, defs, group, names };
