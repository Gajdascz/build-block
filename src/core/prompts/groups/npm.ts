import { inputKeyMap, modules } from '#config';
import type { Validator } from '#validator';
import type prompts from 'prompts';
import {
  createGroupManager,
  createPrompt,
  createStringArrayPrompt,
  parseJson
} from '../utils/index.js';

const MODULE_NAME = 'npm';

const names = inputKeyMap.npm;
type Names = typeof names;
type PromptMap = { [K in keyof Names]: prompts.PromptObject<K> };

const {
  ops: {
    validate: { prop: validateProp }
  }
} = modules.npm;

const defs: PromptMap = {
  name: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.name,
    message: 'Enter the npm package name (will default to provided slug)',
    validatorOverride: (name: unknown) => typeof name === 'string'
  }),
  keywords: createStringArrayPrompt(
    names.keywords,
    'wordpress,block,plugin',
    'Enter the npm keywords in a comma separated string',
    { module: MODULE_NAME, prop: names.keywords }
  ),
  url: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.url,
    message: 'Enter the npm package url'
  }),
  contributors: createPrompt({
    type: 'text',
    moduleName: MODULE_NAME,
    promptName: names.contributors,
    message:
      'Enter the npm contributors in a JSON formatted comma-separated array',
    validatorOverride: (val: unknown) => {
      const { message, value } = validateProp.contributors(
        parseJson<Validator.Types.PartialPerson[]>(val, [])
      );
      return value === null ? message : true;
    },
    initialDefaultOverride: '[{name:"Name",email:"email",url:"url"},{...}]',
    format: (v) => parseJson<Validator.Types.PartialPerson[]>(v, [])
  })
} as const;

const group = createGroupManager({
  slug: 'npm-package-manager',
  prompts: { all: { ...defs } },
  details: { title: 'NPM Package Manager', icon: '📦' }
});

export { type Names, type PromptMap, defs, group, names };
