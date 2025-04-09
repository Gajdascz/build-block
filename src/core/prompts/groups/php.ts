import { inputKeyMap } from '#config';
import type prompts from 'prompts';
import { createGroupManager, createPrompt } from '../utils/index.js';

const MODULE_NAME = 'php';
const names = inputKeyMap.php;
type Names = typeof names;
type PromptMap = { [K in keyof Names & string]: prompts.PromptObject<K> };

const defs: PromptMap = {
  classScope: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.classScope,
    message: 'Enter the php class scope'
  }),
  methodScope: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.methodScope,
    message: 'Enter the php method scope'
  })
} as const;

const group = createGroupManager({
  slug: 'php',
  prompts: { all: { ...defs } },
  details: { title: 'PHP', icon: '📁' }
});

export { type Names, type PromptMap, defs, group, names };
