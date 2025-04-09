import type { Template } from '#constants';
import { Obj, kebabToPascal } from '#utils';
import { Core } from './core/index.js';
import { Npm } from './npm/index.js';
import { Php } from './php/index.js';
import * as WordPress from './wordpress/index.js';

interface ModuleTypes {
  core: Core.Types;
  block: WordPress.Block.Types;
  php: Php.Types;
  wp: WordPress.Core.Types;
  npm: Npm.Types;
}
type ModuleInputs = { [K in keyof ModuleTypes]: ModuleTypes[K]['input'] };

type BlockInputConfig = Omit<
  WordPress.Block.Types['input'],
  'title' | 'slug' | 'namespace' | 'name' | 'description'
>;

interface Input {
  core: ModuleInputs['core'];
  // Provided by core
  block: BlockInputConfig;
  // Allow custom text-transform for default values
  php: Partial<ModuleInputs['php']>;
  wp: ModuleInputs['wp'];
  // Set name to slug by default
  npm: Partial<ModuleInputs['npm']>;
}
type Resolved = { [K in keyof ModuleTypes]: ModuleTypes[K]['resolved'] };
type RequiredMinimumInput = Obj.ExtractRequired<Input['core']>;
type RecommendedMinimumInput = Input['core'] & {
  blockCategory: Input['block']['category'];
  npmPackageName?: Input['npm']['name'];
  npmPackageUrl?: Input['npm']['url'];
  wp?: Input['wp'];
  php?: Input['php'];
  block?: Omit<Input['block'], 'category'>;
  npm?: Omit<Input['npm'], 'name' | 'url'>;
};

interface PartialFullInput {
  core: Input['core'];
  block?: BlockInputConfig;
  php?: Partial<Input['php']>;
  wp?: Partial<Input['wp']>;
  npm?: Partial<Input['npm']>;
}
type InputType =
  | Input
  | RequiredMinimumInput
  | RecommendedMinimumInput
  | PartialFullInput;

const modules = {
  core: Core,
  block: WordPress.Block,
  php: Php,
  wp: WordPress.Core,
  npm: Npm
} as const;
const inputKeyMap: {
  [K in keyof Input]: { [Y in keyof Required<Input[K]>]: Y };
} = {
  core: {
    outputDirectory: 'outputDirectory',
    namespace: 'namespace',
    description: 'description',
    slug: 'slug',
    title: 'title',
    repository: 'repository',
    authorName: 'authorName',
    authorUrl: 'authorUrl',
    authorEmail: 'authorEmail',
    funding: 'funding'
  },
  block: {
    textdomain: 'textdomain',
    ancestor: 'ancestor',
    attributes: 'attributes',
    category: 'category',
    example: 'example',
    icon: 'icon',
    keywords: 'keywords',
    parent: 'parent',
    providesContext: 'providesContext',
    styles: 'styles',
    supports: 'supports',
    usesContext: 'usesContext'
  },
  npm: {
    contributors: 'contributors',
    name: 'name',
    keywords: 'keywords',
    url: 'url'
  },
  php: { classScope: 'classScope', methodScope: 'methodScope' },
  wp: {
    contributors: 'contributors',
    requiresPlugins: 'requiresPlugins',
    tags: 'tags',
    updateUrl: 'updateUrl'
  }
} as const;
const has = {
  requiredMinimumInput: <T extends Obj.StringRecord>(
    input: unknown
  ): input is T & { core: RequiredMinimumInput; [key: string]: unknown } =>
    Obj.is(input, ['core']) && is.requiredMinimumInput(input.core)
} as const;
const is = {
  input: (obj: unknown): obj is Input =>
    Obj.is(obj, ['core', 'block', 'php', 'wp', 'npm'])
    && Obj.is(obj.core, ['namespace', 'slug', 'title'])
    && typeof obj.core.namespace === 'string'
    && typeof obj.core.slug === 'string'
    && typeof obj.core.title === 'string',
  requiredMinimumInput: (obj: unknown): obj is RequiredMinimumInput =>
    Obj.is(obj, ['namespace', 'slug', 'title'])
    && typeof obj.namespace === 'string'
    && typeof obj.slug === 'string'
    && typeof obj.title === 'string',
  recommendedMinimumInput: (obj: unknown): obj is RecommendedMinimumInput =>
    is.requiredMinimumInput(obj)
    && 'blockCategory' in obj
    && typeof obj.blockCategory === 'string'
} as const;
const normalize = {
  requiredMinimumInput: (input: RequiredMinimumInput): Input => ({
    core: { ...input },
    block: {},
    php: {},
    wp: {},
    npm: {}
  }),
  recommendedMinimumInput: ({
    blockCategory,
    npmPackageName,
    npmPackageUrl,
    php,
    wp,
    npm,
    block,
    ...core
  }: RecommendedMinimumInput): Input => ({
    core,
    block: { ...block, ...(blockCategory && { category: blockCategory }) },
    npm: {
      ...npm,
      ...(npmPackageName && { name: npmPackageName }),
      ...(npmPackageName && { url: npmPackageUrl })
    },
    wp: { ...wp },
    php: { ...php }
  }),
  unknown: (input: unknown): Input => {
    if (Obj.is(input)) {
      if (is.input(input)) return input;
      if (has.requiredMinimumInput(input))
        return {
          core: input.core,
          block: input.block ?? {},
          php: input.php ?? {},
          wp: input.wp ?? {},
          npm: input.npm ?? {}
        };
      if (is.recommendedMinimumInput(input))
        return normalize.recommendedMinimumInput(input);
      if (is.requiredMinimumInput(input))
        return normalize.requiredMinimumInput(input);
    }
    throw new Error('Failed to normalize unknown input');
  }
} as const;

class Builder {
  private _input: PartialFullInput = {
    core: { description: '', slug: '', title: '', namespace: '' },
    block: {},
    php: {},
    wp: {},
    npm: {}
  };

  constructor(input: RequiredMinimumInput) {
    this._input.core = { ...input };
  }
  private merge<K extends keyof Input>(key: K, newData: Partial<Input[K]>) {
    this._input[key] = Obj.merge(this._input[key], newData);
    return this;
  }
  core(input: Omit<PartialFullInput['core'], keyof RequiredMinimumInput> = {}) {
    return this.merge('core', input);
  }
  block(input: PartialFullInput['block'] = {}) {
    return this.merge('block', input);
  }
  php(input: PartialFullInput['php'] = {}) {
    return this.merge('php', input);
  }
  wp(input: PartialFullInput['wp'] = {}) {
    return this.merge('wp', input);
  }
  npm(input: PartialFullInput['npm'] = {}) {
    return this.merge('npm', input);
  }
  build() {
    return resolveInput.full(this._input);
  }
}

const resolveInput = {
  module: <M extends keyof ModuleTypes>(
    module: M,
    input: ModuleInputs[M]
  ): ModuleTypes[M]['resolved'] => {
    try {
      const result =
        modules[module].ops.resolve.withValidation.unknownInput(input);
      if (result.value === null)
        throw new Error(`Invalid input: ${result.message}`);

      return result.value;
    } catch (e) {
      throw new Error(`Configuration Error.\n ${(e as Error).message}`);
    }
  },
  full: ({
    core,
    block = {},
    npm = {},
    php = {},
    wp = {}
  }: PartialFullInput): Resolved => {
    const {
      classScope = kebabToPascal(core.slug),
      methodScope = core.slug.replace(/-/g, '_')
    } = php;
    try {
      const _core = resolveInput.module<'core'>('core', core);
      const _block = resolveInput.module<'block'>('block', {
        ...block,
        supports: { ...block.supports, interactivity: true },
        title: _core.title,
        slug: _core.slug,
        namespace: _core.namespace
      });
      const _php = resolveInput.module<'php'>('php', {
        ...php,
        classScope,
        methodScope
      });
      const _wp = resolveInput.module<'wp'>('wp', wp);
      const _npm = resolveInput.module<'npm'>('npm', {
        ...npm,
        name: npm.name && npm.name.length > 0 ? npm.name : _core.slug
      });
      return { core: _core, block: _block, php: _php, wp: _wp, npm: _npm };
    } catch (e) {
      throw new Error(
        `Failed to resolve full input configuration.\n${(e as Error).message}`
      );
    }
  }
} as const;

type ConfiguredTemplate = Template<Resolved>;
type BuilderInstance = InstanceType<typeof Builder>;

export {
  type BlockInputConfig,
  type BuilderInstance,
  type ConfiguredTemplate,
  type Input,
  type InputType,
  type ModuleInputs,
  type ModuleTypes,
  type PartialFullInput,
  type RecommendedMinimumInput,
  type RequiredMinimumInput,
  type Resolved,
  Builder,
  has,
  inputKeyMap,
  is,
  modules,
  normalize,
  resolveInput
};
