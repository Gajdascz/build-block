import { describe, expect, it, vi } from 'vitest';
import { fs, utils } from '../../../../../__mocks__/index.js';

import {
  BASE_EXTENSIONS,
  isDirectoryEmpty,
  normalizeExtensions,
  normalizePath,
  replaceExtension
} from './basic.js';

describe('isDirectoryEmpty', () => {
  utils.beforeAfterEach();

  it('should return true if directory is empty', async () => {
    utils.create.dir('/some/path');
    const result = await isDirectoryEmpty('/some/path');
    expect(result.result).toBe(true);
  });

  it('should return false if directory is not empty', async () => {
    utils.create.dir('/some/path');
    utils.create.file('/some/path/file.txt', 'content');

    const result = await isDirectoryEmpty('/some/path');
    expect(result.result).toBe(false);
  });

  it('should return true if directory does not exist (ENOENT)', async () => {
    const result = await isDirectoryEmpty('/nonexistent/path');
    expect(result.result).toBe(true);
  });

  it('should throw other errors', async () => {
    const origReaddir = fs.promises.readdir;
    fs.promises.readdir = vi.fn().mockImplementation(() => {
      const error = new Error('Permission denied');
      Object.defineProperty(error, 'code', { value: 'EACCES' });
      throw error;
    });

    const result = await isDirectoryEmpty('/protected/path');
    expect(result.result).toBe(false);

    fs.promises.readdir = origReaddir;
  });
});

describe('normalizePath', () => {
  utils.beforeAfterEach();

  it('should remove trailing slash', () => {
    expect(normalizePath('/some/path/')).toBe('/some/path');
  });

  it('should remove trailing backslash', () => {
    expect(normalizePath('/some/path\\')).toBe('/some/path');
  });

  it('should trim whitespace', () => {
    expect(normalizePath('  /some/path  ')).toBe('/some/path');
  });

  it('should handle paths without trailing slashes', () => {
    expect(normalizePath('/some/path')).toBe('/some/path');
  });
});

describe('normalizeExtensions', () => {
  utils.beforeAfterEach();

  it('should handle single extension as string', () => {
    expect(normalizeExtensions('js')).toEqual(['js']);
  });

  it('should handle array of extensions', () => {
    expect(normalizeExtensions(['js', 'ts', 'jsx'])).toEqual([
      'js',
      'ts',
      'jsx'
    ]);
  });

  it('should remove dots from extensions', () => {
    expect(normalizeExtensions(['.js', 'ts', '.jsx'])).toEqual([
      'js',
      'ts',
      'jsx'
    ]);
  });

  it('should trim whitespace from extensions', () => {
    expect(normalizeExtensions(['  js  ', 'ts', ' jsx '])).toEqual([
      'js',
      'ts',
      'jsx'
    ]);
  });

  it('should convert extensions to lowercase', () => {
    expect(normalizeExtensions(['JS', 'Ts', 'JSX'])).toEqual([
      'js',
      'ts',
      'jsx'
    ]);
  });

  it('should filter out invalid values', () => {
    //@ts-expect-error - Testing invalid behavior
    expect(normalizeExtensions(['js', '', '   ', null, undefined])).toEqual([
      'js'
    ]);
  });
});

describe('replaceExtension', () => {
  utils.beforeAfterEach();

  it('should replace the extension of a file path', () => {
    expect(replaceExtension('/some/path/file.js', 'ts')).toBe(
      '/some/path/file.ts'
    );
  });

  it('should handle file paths without extensions', () => {
    expect(replaceExtension('/some/path/file', 'ts')).toBe(
      '/some/path/file.ts'
    );
  });

  it('should handle file paths with multiple dots', () => {
    expect(replaceExtension('/some/path/file.config.js', 'ts')).toBe(
      '/some/path/file.config.ts'
    );
  });
});

describe('BASE_EXTENSIONS', () => {
  it('should export the expected base extensions', () => {
    expect(BASE_EXTENSIONS).toEqual(['js', 'ts', 'json']);
  });
});
