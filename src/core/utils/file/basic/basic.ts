import { cleanStringArray } from '#utils';
import fs from 'fs';
import path from 'path';

interface ResultObj<T> {
  result: T | null;
  error?: string;
}

type FileContentResolver<TLoaded, TResolved = TLoaded> = (
  parsed: Partial<TLoaded> | TLoaded
) => TResolved | null;
type FileContentResolverArg<T> = Parameters<FileContentResolver<T>>[0];
const BASE_EXTENSIONS = ['js', 'ts', 'json'];

/**
 * Normalizes a path by removing trailing slashes.
 */
const normalizePath = (_path: string): string => {
  let result = _path.trim();
  if (result.endsWith('/') || result.endsWith('\\'))
    result = result.slice(0, -1);
  return result;
};
/**
 * Normalizes file extensions by ensuring they don't start with a dot and filtering out invalid values.
 */
const normalizeExtensions = (exts: string | string[]) =>
  cleanStringArray(Array.isArray(exts) ? exts : [exts]).map((ext) =>
    (ext.startsWith('.') ? ext.substring(1) : ext).trim().toLowerCase()
  );
/**
 * Checks if a directory is empty or doesn't exist.
 */
const isDirectoryEmpty = async (
  dirPath: string
): Promise<ResultObj<boolean>> => {
  try {
    const files = await fs.promises.readdir(dirPath);
    return { result: files.length === 0 };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return { result: true };

    return { result: false, error: `Directory not found: ${dirPath}` };
  }
};
const replaceExtension = (pathWithExt: string, newExt: string) => {
  const ext = path.extname(pathWithExt);
  if (ext === '') return `${pathWithExt}.${newExt}`;
  return pathWithExt.replace(ext, `.${newExt}`);
};

export {
  type FileContentResolver,
  type FileContentResolverArg,
  type ResultObj,
  BASE_EXTENSIONS,
  isDirectoryEmpty,
  normalizeExtensions,
  normalizePath,
  replaceExtension
};
