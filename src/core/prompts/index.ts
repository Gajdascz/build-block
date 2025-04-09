import {
  type ResultObj,
  getCwdWithSlug,
  INPUT_CONFIG_PROVIDER_TYPES,
  isConstant,
  SUPPORTED_EXTS
} from '#constants';
import { file } from '#utils';
import prompts from 'prompts';
import { Core, Npm, Php, WpBlock, WpCore } from './groups/index.js';
import { formatAnswers } from './utils/helpers.js';

const configPromptExecMap = {
  minimum: Core.group.execRequired.bind(Core.group),
  recommended: async () => {
    const { result: coreResult, error: coreError } = await Core.group.execAll();
    if (!coreResult) return { result: null, error: coreError };

    const { result: npmResult, error: npmError } = await Npm.group.execPrompts([
      'name',
      'url'
    ]);
    if (!npmResult) return { result: null, error: npmError };

    const { result: blockResult, error: blockError } =
      await WpBlock.group.execPrompts(['category']);

    if (!blockResult) return { result: null, error: blockError };

    return {
      result: {
        core: coreResult,
        npm: npmResult,
        block: blockResult,
        php: {},
        wp: {}
      }
    };
  },
  full: async () => {
    const { result: coreResult, error: coreError } = await Core.group.execAll();
    if (!coreResult) return { result: null, error: coreError };

    const { result: npmResult, error: npmError } = await Npm.group.execAll();
    if (!npmResult) return { result: null, error: npmError };

    const { result: phpResult, error: phpError } = await Php.group.execAll();
    if (!phpResult) return { result: null, error: phpError };

    const { result: wpCoreResult, error: wpCoreError } =
      await WpCore.group.execAll();
    if (!wpCoreResult) return { result: null, error: wpCoreError };

    const { result: blockResult, error: blockError } =
      await WpBlock.group.execAll();
    if (!blockResult) return { result: null, error: blockError };

    return {
      result: {
        core: coreResult,
        npm: npmResult,
        block: blockResult,
        php: phpResult,
        wp: wpCoreResult
      }
    };
  }
} as const;

type ConfigLevel = 'minimum' | 'recommended' | 'full';
const isConfigLevel = (t: unknown): t is ConfigLevel =>
  (typeof t === 'string' && t === 'minimum')
  || t === 'recommended'
  || t === 'full';
const init = {
  confirmFullConfig: async (cfg?: object): Promise<ResultObj<true>> => {
    const result = await prompts({
      name: 'confirmFullConfig',
      type: 'confirm',
      message: (prev: object = {}) =>
        `🔶 Review your completed configuration:\n\n${formatAnswers(
          cfg ?? prev
        )}\n\n🔷 Do you want to proceed?`,
      initial: true
    });
    if (!result.confirmFullConfig)
      return { result: null, error: `[❗] Cancelled` };
    return { result: true };
  },
  selectConfigLevel: async () => {
    const result = await prompts({
      name: 'configLevel',
      type: 'select',
      message: 'Select the configuration level',
      choices: [
        {
          title: 'Recommended',
          value: 'recommended',
          description: 'Recommended configuration.',
          selected: true
        },
        {
          title: 'Minimum',
          value: 'minimum',
          description: 'Minimum required configuration.'
        },
        { title: 'Full', value: 'full', description: 'Full configuration.' }
      ]
    });
    if (!result.configLevel || !isConfigLevel(result.configLevel))
      return {
        result: null,
        error: `[❌] Invalid configuration level provided: ${result.configLevel}`
      };
    return { result: result.configLevel };
  },
  isReady: async (question = 'Ready to proceed?'): Promise<ResultObj<true>> => {
    const result = await prompts({
      name: 'isReady',
      type: 'confirm',
      message: `[❔] ${question}?`,
      initial: true
    });
    if (!result.isReady) return { result: null, error: `[❗] Cancelled` };
    return { result: true };
  },
  configFilePath: async (): Promise<ResultObj<string>> => {
    const result = await prompts({
      name: 'configFilePath',
      type: 'text',
      message: `Enter the path to the configuration file with a supported extension: [${SUPPORTED_EXTS.toString()}]`,
      initial: getCwdWithSlug() + '.json',
      format: (ans: string) => file.findFile(ans).result
    });
    if (!result.configFilePath || typeof result.configFilePath !== 'string') {
      const tryAgainResult = await prompts({
        name: 'tryAgain',
        type: 'confirm',
        message: `❌ Invalid file path provided. Do you want to try again?`,
        initial: true
      });
      if (tryAgainResult.tryAgain) return init.configFilePath();
      else return { result: null, error: `[❌] Invalid file path provided` };
    }
    return { result: result.configFilePath };
  },
  configProvider: async () => {
    const result = await prompts({
      name: 'configurationProvider',
      type: 'select',
      message: 'Choose a method to provide configuration',
      choices: [
        {
          title: 'Interactive Prompts',
          selected: true,
          value: INPUT_CONFIG_PROVIDER_TYPES.prompts,
          description: 'Prompts for configuration values.'
        },
        {
          title: 'Configuration File',
          value: INPUT_CONFIG_PROVIDER_TYPES.filePath,
          description: `Prompts for the path to a configuration file with a supported extension: [${SUPPORTED_EXTS.toString()}]. If extension is omitted the program will try to find the file in the provided/current directory.`
        }
      ]
    });
    if (
      !result.configurationProvider
      || !isConstant.configInputProvider(result.configurationProvider)
    )
      return {
        result: null,
        error: `[❌] Invalid configuration provided: ${result.configurationProvider}`
      };
    return { result: result.configurationProvider };
  },
  interactiveConfig: async (type: ConfigLevel = 'recommended') => {
    console.log('📝 Interactive Configuration');
    const { result: configResult, error: configError } =
      await configPromptExecMap[type]();
    if (!configResult) return { result: null, error: configError };

    return { result: configResult };
  },
  confirmOverwrite: async () => {
    const result = await prompts({
      name: 'confirmOverwrite',
      type: 'confirm',
      message: `🔶 The output directory already exists. Do you want to overwrite it?`,
      initial: false
    });
    return { result: !!result.confirmOverwrite };
  }
} as const;

export { type ConfigLevel, init };
export const groups = {
  Core: Core.group,
  Npm: Npm.group,
  WpBlock: WpBlock.group,
  WpCore: WpCore.group
} as const;
