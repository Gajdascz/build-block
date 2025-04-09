/**
 * WordPress Block Generator
 *
 * A tool for generating modern WordPress block
 * plugins with best practices and sensible defaults.
 */
export {
  type BuildResult,
  /**
   * @important using buildBlock will attempt to write to the disk when executed.
   */
  build as buildBlock,
  /**
   * Provides a chainable approach to configuration building. To be written to the disk using the cli or write method.
   */
  builder as builderBlock,
  /**
   * Utility for writing a fully typed configuration to be written to the disk using the cli or write method.
   */
  config as configBlock,
  /**
   * Writes a BuildResult object to the disk.
   */
  writeResolved as writeBlockConfig
} from './api.js';
export type {
  BuilderInstance as BlockBuilderInstance,
  BlockInputConfig,
  ModuleInputs as ConfigModuleInputs,
  ModuleTypes as ConfigModuleTypes,
  ConfiguredTemplate as ConfiguredFileTemplate,
  PartialFullInput as InputConfig,
  InputType as InputConfigType,
  RecommendedMinimumInput as RecommendedMinimumInputConfig,
  RequiredMinimumInput as RequiredMinimumInputConfig,
  Resolved as ResolvedConfig,
  Input as StrictShapeInputConfig
} from './core/index.js';
