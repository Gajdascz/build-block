import fs from 'fs';
import path from 'path';
import { type ResultObj, isDirectoryEmpty } from '../basic/basic.js';

interface WriteTemplate<Content extends object = object> {
  filename: string;
  generate: (cfg: Content, ...args: any[]) => string;
  relativePath?: string;
}

/**
 * Controls what happens when the output directory is not empty
 * - 'prompt': Ask user for confirmation (requires prompts dependency to be passed)
 * - 'force': Always overwrite without asking
 * - 'skip': Never overwrite, return false if directory is not empty
 */
type OverwriteBehavior = 'prompt' | 'force' | 'skip';
/**
 * Optional prompts function to use if overwriteBehavior is 'prompt'
 */
type OverwritePromptFn = () => Promise<
  { result: boolean } & { [key: string]: unknown }
>;

/**
 * Options for writing templates to an output directory
 */
interface WriteOpts {
  overwrite?: { behavior?: OverwriteBehavior; promptFn?: OverwritePromptFn };
}

const checkEmpty = async (
  outputDir: string,
  behavior: OverwriteBehavior,
  promptFn?: OverwritePromptFn
) => {
  const isEmpty = (await isDirectoryEmpty(outputDir)).result;
  if (isEmpty) return true;
  switch (behavior) {
    case 'force':
      return true;
    case 'prompt': {
      if (typeof promptFn !== 'function') {
        console.error(
          'No prompt function provided for overwrite behavior when overwrite behavior is set to prompt.'
        );
        return false;
      }
      const { result } = await promptFn();
      if (!result) {
        console.log('Operation cancelled by user.');
        return false;
      } else return result;
    }
    default:
      console.log(`Directory ${outputDir} is not empty. Skipping write.`);
      return false;
  }
};

/**
 * Writes templates to the output directory.
 */
const write = async <Content extends object>(
  config: Content & { outputDirectory?: string },
  templates: WriteTemplate<Content>[],
  { overwrite = {} }: WriteOpts = {}
): Promise<ResultObj<true>> => {
  const { behavior = 'skip', promptFn = undefined } = overwrite;
  const outputDir =
    'outputDirectory' in config && typeof config.outputDirectory === 'string' ?
      config.outputDirectory
    : path.join(process.cwd(), 'output');
  const shouldContinue = await checkEmpty(outputDir, behavior, promptFn);
  if (!shouldContinue)
    return { result: null, error: 'Operation cancelled by user' };

  await fs.promises.mkdir(outputDir, { recursive: true });

  const writePromises = templates.map(
    async ({ filename, generate, relativePath }) => {
      const filePath =
        relativePath ?
          path.join(outputDir, relativePath, filename)
        : path.join(outputDir, filename);

      // Create directory if it doesn't exist
      const fileDir = path.dirname(filePath);
      await fs.promises.mkdir(fileDir, { recursive: true });

      // Generate and write file content
      const content = generate(config);
      await fs.promises.writeFile(filePath, content);
      return filePath;
    }
  );

  await Promise.all(writePromises);
  return { result: true };
};

export {
  type OverwriteBehavior,
  type OverwritePromptFn,
  type WriteOpts,
  type WriteTemplate,
  write
};
