import * as _prompts from '#_prompts';
import {
  type ConfiguredTemplate,
  type Input,
  type InputType,
  type Resolved,
  create
} from '#config';
import {
  type SupportedExtension,
  CFG_SLUG,
  getCwdWithSlug,
  SUPPORTED_EXTS
} from '#constants';
import * as Templates from '#templates';
import { file } from '#utils';
import path from 'path';

const ERR_PREFIX = '[❗](resolver)';
const errMsg = (msg: string) => `${ERR_PREFIX} ${msg}`.trim();

interface PackageJsonConfig {
  [CFG_SLUG]?: InputType;
}

interface ResolvedWithTemplates {
  config: Resolved;
  templates: ConfiguredTemplate[];
}
type ResolverResult = Promise<ResolvedWithTemplates>;
/**
 * Resolves input configuration and loads templates
 */
const resolveWithTemplates = (
  cfg: InputType | unknown
): ResolvedWithTemplates => {
  try {
    const resolved = create.from.unknown(cfg);
    return {
      config: resolved,
      templates: [...Templates.load(resolved.core.slug)]
    } as const;
  } catch (err) {
    throw new Error(
      errMsg(`Failed to resolve configuration:\n${(err as Error).message}`)
    );
  }
};
const handle = {
  json: async (filePath: string): ResolverResult => {
    const { result, error } = await file.parseJson<
      Input,
      ResolvedWithTemplates
    >(filePath, { resolverFn: resolveWithTemplates });
    if (result === null)
      throw new Error(errMsg(`Failed to parse JSON config:\n${error}`));

    return result;
  },
  module: async (filePath: string): ResolverResult => {
    const { result, error } = await file.loadModule<
      ResolvedWithTemplates,
      'config'
    >(filePath, { resolverFn: resolveWithTemplates, exportKey: 'config' });
    if (result === null)
      throw new Error(
        errMsg(`Failed to load module config from "${filePath}":\n${error}`)
      );

    return result;
  },
  prompt: async (
    level: _prompts.ConfigLevel = 'recommended'
  ): ResolverResult => {
    try {
      const { result, error } = await _prompts.init.interactiveConfig(level);
      if (result === null) throw new Error(error);
      return resolveWithTemplates(result);
    } catch (error) {
      throw new Error(
        errMsg(
          `Failed to resolve prompt config:\n${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    }
  },
  package: async (packagePath = './'): ResolverResult => {
    const { result, error } = await file.parseJson<
      PackageJsonConfig,
      ResolvedWithTemplates
    >(packagePath, {
      fileName: 'package',
      resolverFn: (parsed) =>
        parsed[CFG_SLUG] ? resolveWithTemplates(parsed[CFG_SLUG]) : null
    });
    if (result === null)
      throw new Error(
        errMsg(
          `Failed to load package.json from ${packagePath}\nfindFileError: ${error}`
        )
      );
    return result;
  }
} as const;

/**
 * Maps file extensions to their appropriate handlers
 */
const extensionHandlerMap: {
  [S in SupportedExtension]: (
    filePath: string
  ) => Promise<ResolvedWithTemplates>;
} = { json: handle.json, ts: handle.module, js: handle.module } as const;

const resolveInput = (input: InputType | unknown): ResolvedWithTemplates =>
  resolveWithTemplates(input);
const resolvePrompt = handle.prompt;
const resolveFilePath = async (
  filePath?: string,
  fileName?: string,
  extension?: string
): Promise<ResolvedWithTemplates> => {
  const searchPath = filePath ?? getCwdWithSlug() + `.${extension ?? 'json'}`;
  let foundFilePath = file.findFile(searchPath, {
    fileName: fileName,
    extension: extension ?? SUPPORTED_EXTS.arr
  });
  if (foundFilePath.result === null) {
    const { result, error } = await _prompts.init.configFilePath();
    if (result === null)
      throw new Error(errMsg(`Unable to locate config file:\n${error}`));
    foundFilePath = file.findFile(result);
    if (foundFilePath.result === null)
      throw new Error(errMsg('Unable to locate config file'));
  }
  const ext = path.extname(foundFilePath.result).slice(1).toLowerCase();
  if (!SUPPORTED_EXTS.is(ext))
    throw new Error(
      errMsg(
        `Unsupported file extension: .${ext}. Supported extensions include: ${SUPPORTED_EXTS.toString()}`
      )
    );
  return await extensionHandlerMap[ext](foundFilePath.result);
};
const resolvePackage = handle.package;
const resolver = {
  input: resolveInput,
  prompt: resolvePrompt,
  filePath: resolveFilePath,
  package: handle.package
} as const;
export {
  type PackageJsonConfig,
  type ResolvedWithTemplates,
  type ResolverResult,
  resolveFilePath,
  resolveInput,
  resolvePackage,
  resolvePrompt,
  resolver
};
