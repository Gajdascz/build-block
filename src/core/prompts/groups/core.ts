import { type ModuleInputs, type ModuleTypes, inputKeyMap } from '#config';
import type prompts from 'prompts';
import { createGroupManager, createPrompt } from '../utils/index.js';

const MODULE_NAME = 'core';

const names = inputKeyMap.core;
type Names = typeof names;
type PromptMap = { [K in keyof Names]: prompts.PromptObject<Names[K]> };

const defs: PromptMap = {
  outputDirectory: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.outputDirectory,
    initialDefaultOverride: process.cwd(),
    message:
      'Enter the output directory (final directory will always be the provided slug). So if you provide ./target and slug is my-plugin, the final directory will be ./target/my-plugin). Leave empty to use the current directory.',
    validatorOverride: (dirPath: unknown) =>
      typeof dirPath === 'string' && dirPath.length > 0
  }),
  namespace: createPrompt({
    type: 'text',
    required: true,
    moduleName: MODULE_NAME,
    promptName: names.namespace,
    message: 'Enter the namespace'
  }),
  slug: createPrompt({
    type: 'text',
    required: true,
    moduleName: MODULE_NAME,
    promptName: names.slug,
    message: 'Enter the slug'
  }),
  title: createPrompt({
    type: 'text',
    required: true,
    moduleName: MODULE_NAME,
    promptName: names.title,
    message: 'Enter the title'
  }),
  description: createPrompt({
    type: 'text',
    required: true,
    moduleName: MODULE_NAME,
    promptName: names.description,
    message: 'Enter the description'
  }),
  repository: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.repository,
    message: 'Enter the repository'
  }),
  authorEmail: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.authorEmail,
    message: 'Enter the author email'
  }),
  authorName: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.authorName,
    message: 'Enter the author name'
  }),
  authorUrl: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.authorUrl,
    message: 'Enter the author url'
  }),
  funding: createPrompt({
    moduleName: MODULE_NAME,
    promptName: names.funding,
    type: 'text',
    message: 'Enter the funding url'
  })
} as const;

const required: {
  [K in keyof ModuleTypes['core']['requiredInput']]: prompts.PromptObject<K>;
} = {
  namespace: defs.namespace,
  slug: defs.slug,
  title: defs.title,
  description: defs.description
};
const group = createGroupManager<
  keyof ModuleInputs['core'],
  keyof Pick<ModuleInputs['core'], 'slug' | 'title' | 'namespace'>
>({
  slug: 'core',
  prompts: { all: { ...defs }, required },
  details: { title: 'Core', icon: '⚙️' }
});

export { type Names, type PromptMap, group };
