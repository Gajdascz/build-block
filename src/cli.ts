import { file } from '#utils';
import { Command } from 'commander';
import { type BuildResult, build } from './api.js';
import {
  CFG_SLUG,
  EXIT_CODES,
  SUPPORTED_EXTS,
  VERSIONS
} from './core/constants/index.js';
import * as _prompts from './core/prompts/index.js';

interface CliOpts {
  config?: string;
  outputDirectory?: string;
  interactive?: boolean;
}

const exit = (msg?: string, exitCode = 0) => {
  if (msg) console.log(msg);
  process.exit(exitCode);
};

const displayBuildSuccess = (buildResult: BuildResult): void => {
  console.log(
    `🎉 Project successfully generated at: ${buildResult.outputDirectory}`
  );
  console.log(`📚 Created ${buildResult.templates.length} files.`);
};

const checkReady = async () => {
  const { result: isReady, error } = await _prompts.init.isReady(
    'Welcome to the WordPress Block Plugin Builder! Ready to start'
  );
  if (!isReady) exit(error, EXIT_CODES.cancelled);
};

const determineConfigMode = async () => {
  const { result: modeResult, error: modeError } =
    await _prompts.init.configProvider();
  if (!modeResult) exit(modeError, EXIT_CODES.cancelled);
  return modeResult;
};

/**
 * Handle any errors during initialization
 */
const handleInitError = (error: unknown): never => {
  console.error(
    '❌ Error:\n',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(EXIT_CODES.error);
};

const buildFromPrompts = async (): Promise<BuildResult> => {
  const { result: configLevelResult, error: configLevelError } =
    await _prompts.init.selectConfigLevel();
  if (!configLevelResult) return exit(configLevelError, EXIT_CODES.cancelled);
  return build.fromPrompts(configLevelResult);
};

const tryFindConfigFile = (options?: CliOpts) => {
  const searchPath = options?.config ?? process.cwd();
  console.log(`🔍 Looking for configuration file at ${searchPath}`);
  const { result } = file.findFile(searchPath, { fileName: CFG_SLUG });
  if (result === null) console.log(`⚠️ No valid configuration file found.`);
  else console.log(`📂 Configuration file found.`);
  return result;
};

const getConfigFilePath = async (options?: CliOpts): Promise<string | null> => {
  const { result } = await _prompts.init.configFilePath();
  const pathResult = result ?? tryFindConfigFile(options);
  return pathResult;
};
/**
 * Action handlers for CLI commands
 */
const handlers = {
  /**
   * Main initialization handler
   */
  init: async (options: {
    config?: string;
    interactive?: boolean;
  }): Promise<void> => {
    try {
      const { config, interactive } = options;
      let mode =
        config ? 'filePath'
        : interactive ? 'prompts'
        : null;
      if (!mode) {
        await checkReady();
        mode = await determineConfigMode();
      }
      let buildResult: BuildResult | null = null;
      if (mode === 'filePath') {
        const cfgFilePath =
          typeof config === 'string' ? config : (
            await getConfigFilePath(options)
          );
        if (!cfgFilePath)
          console.log(
            '[❗] Unable to load configuration file. Switching to interactive mode.'
          );
        else buildResult = await build.fromFile({ filePath: cfgFilePath });
      }

      // Only execute if buildResult is null
      buildResult ??= await buildFromPrompts();

      displayBuildSuccess(buildResult);
    } catch (error) {
      handleInitError(error);
    }
  }
};

export const initProgram = () =>
  new Command()
    .name('@toolbox-wp/build-block')
    .version(VERSIONS.cli)
    .description(
      'CLI for generating WordPress block plugin development environment.'
    )
    .command('init', { isDefault: true })
    .description('Initialize a new WordPress block plugin project')
    .option(
      '-c, --config <path>',
      `Path to the configuration file. Supported formats: ${SUPPORTED_EXTS.toString()}`,
      undefined
    )
    .option(
      '-i, --interactive',
      'Use interactive mode for configuration. This mode has limited configuration options',
      undefined
    )
    .action(handlers.init);

export const run = async (argv = process.argv): Promise<void> => {
  try {
    const program = initProgram();
    await program.parseAsync(argv);
    if (
      program.args[0]
      && !program.commands.some((cmd) => cmd.name() === program.args[0])
    ) {
      program.help();
    }
  } catch (err) {
    console.error('❌ Error:\n', err);
    process.exit(EXIT_CODES.error);
  }
};
