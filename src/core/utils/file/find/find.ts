import fs from 'fs';
import path from 'path';
import {
  type ResultObj,
  BASE_EXTENSIONS,
  normalizeExtensions,
  normalizePath,
  replaceExtension
} from '../basic/basic.js';

/**
 * Options for file search operations.
 */
interface FindFileOpts {
  fileName?: string;
  extension?: string | string[];
}
/**
 * Finds a file based on the provided path and options and returns the full file path if it exists.
 */
const findFile = (
  filePath: string,
  { fileName = '', extension = [] }: FindFileOpts = {}
): ResultObj<string> => {
  const normalPath = normalizePath(filePath);
  const exts = normalizeExtensions(extension);
  /** Append fileName if provided */
  const basePath = path.resolve(
    `${normalPath}${fileName ? `/${fileName}` : ''}`
  );

  /** Check if the provided path leads to a file with an extension. */
  const originalExt = path.extname(basePath);
  const normalizedExt = normalizeExtensions(originalExt)[0] ?? '';
  if (
    normalizedExt.length > 0
    && [...exts, ...BASE_EXTENSIONS].includes(normalizedExt)
  ) {
    if (fs.existsSync(basePath)) return { result: basePath };
    const normalizedPath = replaceExtension(basePath, normalizedExt);
    if (fs.existsSync(normalizedPath)) return { result: normalizedPath };
    else
      return {
        result: null,
        error: `File not found: ${normalPath}.\nPlease provide a valid directory path.`
      };
  }
  /**
   * Since no file extension was provided in the path/fileName, ensure supported extensions are provided
   */
  if (exts.length === 0)
    return {
      result: null,
      error: `No extension provided for file search.\nYou can provide an extension by either:\n  - specifying it in the file name (e.g., ${fileName}.ext)\n  - providing an array of extensions (e.g., ['.ext1', '.ext2'])\n  - providing a single extension (e.g., '.ext')`
    };
  /** Check the path with the sanitized extensions */
  for (const ext of exts) {
    const _path = `${basePath}.${ext}`;
    if (fs.existsSync(_path)) return { result: _path };
  }
  return {
    result: null,
    error: `File not found:\nresolvedFilePath: ${basePath}\nextension: ${exts.join(', ')}\n`
  };
};
export { type FindFileOpts, findFile };
