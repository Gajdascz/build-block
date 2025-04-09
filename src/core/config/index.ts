import {
  type BuilderInstance,
  type InputType,
  type PartialFullInput,
  type RecommendedMinimumInput,
  type RequiredMinimumInput,
  type Resolved,
  Builder,
  is,
  normalize,
  resolveInput
} from './composite.js';

/**
 * Configuration utilities for WordPress block plugins
 *
 * @example
 * ```ts
 * // Create a minimal configuration
 * const minConfig = {
 *   namespace: 'my-plugin',
 *   slug: 'awesome-block',
 *   title: 'My Awesome Block'
 * };
 *
 * // Create a recommended configuration
 * const recConfig = {
 *   namespace: 'my-plugin',
 *   slug: 'awesome-block',
 *   title: 'My Awesome Block',
 *   blockCategory: 'widgets',
 *   npmPackageName: 'my-custom-package'
 * };
 *
 * // Create using builder pattern
 * const config = create.builder({
 *   core: {
 *     namespace: 'my-plugin',
 *     slug: 'awesome-block',
 *     title: 'My Awesome Block'
 *   }
 * })
 * .block({ category: 'widgets' })
 * .npm({ name: 'custom-package' })
 * .build();
 * ```
 */
export const create = {
  builder: (input: RequiredMinimumInput): BuilderInstance => new Builder(input),
  config: (input: PartialFullInput): Resolved => create.from.unknown(input),
  from: {
    full: (input: PartialFullInput): Resolved => resolveInput.full(input),
    recommendedMinimum: (input: RecommendedMinimumInput): Resolved =>
      resolveInput.full(normalize.recommendedMinimumInput(input)),
    requiredMinimum: (input: RequiredMinimumInput): Resolved =>
      resolveInput.full(normalize.requiredMinimumInput(input)),
    unknown: (input: unknown | InputType): Resolved => {
      if (is.requiredMinimumInput(input))
        return create.from.requiredMinimum(input);
      if (is.recommendedMinimumInput(input))
        return create.from.recommendedMinimum(input);
      return resolveInput.full(normalize.unknown(input));
    }
  }
} as const;

export const validate = {
  requiredMinimum: is.requiredMinimumInput,
  recommendedMinimum: is.recommendedMinimumInput,
  input: is.input
} as const;

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
  inputKeyMap,
  modules
} from './composite.js';
