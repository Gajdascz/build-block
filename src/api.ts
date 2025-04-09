import type { ConfigLevel } from '#_prompts';
import {
  type BuilderInstance,
  type ConfiguredTemplate,
  type InputType,
  type PartialFullInput,
  type RequiredMinimumInput,
  type Resolved,
  create
} from '#config';
import { file } from '#utils';
import path from 'path';
import { type ResolvedWithTemplates, Prompt, resolver } from './core/index.js';

const enforceSlug = (outdir: string, slug: string) => {
  const normalizedPath = path.normalize(outdir);
  const baseName = path.basename(normalizedPath);
  return baseName.toLowerCase() === slug.toLowerCase() ?
      normalizedPath
    : path.join(normalizedPath, slug);
};
export const writeResolved = async ({
  config,
  templates
}: ResolvedWithTemplates) => {
  const { result, error } = await Prompt.init.confirmFullConfig(config);
  if (!result) {
    console.error(error);
    process.exit(1);
  }
  const outputDirectory = enforceSlug(
    config.core.outputDirectory,
    config.core.slug
  );
  const { result: writeResult, error: writeError } = await file.write(
    { ...config, outputDirectory },
    templates,
    {
      overwrite: { behavior: 'prompt', promptFn: Prompt.init.confirmOverwrite }
    }
  );
  if (!writeResult) {
    console.error(writeError);
    process.exit(1);
  }
  console.log(`[✅] Project generated successfully!
Recommended next steps:
1. cd ${outputDirectory}
2. pnpm install        # Install dependencies
3. pnpm up             # Update packages
4. pnpm run cleanup    # Executes eslint and prettier
5. pnpm run start      # Start development server
`);
  return { config, templates, outputDirectory };
};
export interface BuildResult {
  config: Resolved;
  templates: ConfiguredTemplate[];
  outputDirectory: string;
}
/**
 * Build WordPress block plugin projects
 *
 * @example
 * ```ts
 * // Build from a configuration file
 * const result = await build.fromFile({
 *   filePath: './my-config.json'
 * });
 *
 * // Build using interactive prompts
 * const result = await build.fromPrompts();
 *
 * // Build from a configuration object
 * const result = await build.fromConfig({
 *   namespace: 'my-plugin',
 *   slug: 'awesome-block',
 *   title: 'My Awesome Block'
 * });
 * ```
 */
export const build = {
  /**
   * Generate a project from a configuration file
   */
  fromFile: async ({
    extension,
    fileName,
    filePath
  }: {
    filePath?: string;
    fileName?: string;
    extension?: string;
  }): Promise<BuildResult> =>
    await writeResolved(await resolver.filePath(filePath, fileName, extension)),
  /**
   * Generate a project using interactive prompts
   */
  fromPrompts: async (
    configLevel: ConfigLevel = 'recommended'
  ): Promise<BuildResult> =>
    await writeResolved(await resolver.prompt(configLevel)),
  /**
   * Generate a project directly from a configuration object
   */
  fromConfig: async (config: InputType): Promise<BuildResult> =>
    await writeResolved(resolver.input(config)),
  /**
   * Generate a project from a package.json file
   * - The property name is build-block
   */
  fromPackage: async (packagePath = './'): Promise<BuildResult> =>
    await writeResolved(await resolver.package(packagePath))
} as const;

export const config: (input: PartialFullInput) => Resolved = create.config;
/**
 * Create a configuration builder with fluent API
 *
 * @example
 * ```ts
 * builder({
 *   core: {
 *     namespace: 'my-plugin',
 *     slug: 'my-block',
 *     title: 'My Block'
 *   }
 * })
 * .block({ category: 'widgets' })
 * .build();
 * ```
 */
export const builder: (input: RequiredMinimumInput) => BuilderInstance =
  create.builder;
