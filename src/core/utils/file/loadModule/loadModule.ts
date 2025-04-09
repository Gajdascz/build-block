import { createJiti } from 'jiti';
import type { FileContentResolver, ResultObj } from '../basic/basic.js';

const jiti = createJiti(process.cwd());
const DEFAULT_FILE = 'build-block.ts';

const isValidObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The supported values for the exported module data
 */
type ExportableValue<TLoaded extends object, TResolved = TLoaded> =
  | TResolved
  | (() => Promise<TResolved> | TResolved);

const isExportableValue = <TLoaded extends object>(
  importedValue: unknown
): importedValue is ExportableValue<TLoaded> =>
  typeof importedValue === 'function'
  || (typeof importedValue === 'object'
    && importedValue !== null
    && !Array.isArray(importedValue)
    && Object.keys(importedValue).length > 0);

/**
 * Represents possible module structures when importing from a script (ts|js) file
 *
 * A module can export it's content as:
 * 1. default export
 * 2. A named export called 'config'
 * 3. The entire module
 * 4. A function that returns a it's content
 */
type ModuleExport<TLoaded extends object, KeyofExport extends string> =
  | ExportableValue<TLoaded>
  | { default: ExportableValue<TLoaded> }
  | { [P in KeyofExport]: ExportableValue<TLoaded> }
  | { [key: string]: unknown };

const resolveModuleExport = <
  TLoaded extends object,
  KeyofExport extends string
>(
  imported: unknown,
  exportKey: KeyofExport = 'config' as KeyofExport
): ExportableValue<TLoaded> | null => {
  if (isValidObject(imported)) {
    let value: unknown = imported;
    if ('default' in imported) value = imported.default;
    if (exportKey in imported) value = imported[exportKey];
    if (isExportableValue<TLoaded>(value)) return value;
  }
  return null;
};
interface LoadModuleOpts<
  TLoaded,
  ExportKey extends string,
  TResolved = TLoaded
> {
  resolverFn?: FileContentResolver<TLoaded, TResolved>;
  exportKey?: ExportKey;
}
const loadModule = async <
  TLoaded extends object,
  ExportKey extends string,
  TResolved = TLoaded
>(
  cfgPath = `${process.cwd()}/${DEFAULT_FILE}`,
  {
    resolverFn,
    exportKey = 'config' as ExportKey
  }: LoadModuleOpts<TLoaded, ExportKey, TResolved> = {}
): Promise<ResultObj<TResolved>> => {
  let err: unknown;
  try {
    const module = (await jiti.import(cfgPath)) as ModuleExport<
      TLoaded,
      ExportKey
    >;
    const importedValue = resolveModuleExport<TLoaded, ExportKey>(
      module,
      exportKey
    );
    if (importedValue !== null) {
      let value;
      if (typeof importedValue === 'function') value = await importedValue();
      else value = importedValue;
      const result =
        resolverFn ? resolverFn(value) : (value as unknown as TResolved);
      if (result === null)
        // Caught and message is added to return result object
        throw new Error(
          `Resolver function returned null for the module export`
        );
      return { result };
    }
  } catch (e) {
    err = e;
  }
  return {
    result: null,
    error: `Failed to load script config from ${cfgPath}: ${
      err instanceof Error ? err.message : String(err)
    }`
  };
};

export {
  type ExportableValue,
  type LoadModuleOpts,
  type ModuleExport,
  loadModule
};
