import { describe, expect, it, vi } from 'vitest';
import { parseJson } from './parseJson.ts';

import { fs, utils } from '../../../../../__mocks__/index.js';
describe('parseJson', () => {
  utils.beforeAfterEach();
  it('should parse JSON file and return result when file exists and is valid JSON', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file(
      '/resolved/some/dir/config.json',
      '{"name":"test","value":123}'
    );

    const { result, error } = await parseJson<{ name: string; value: number }>(
      '/some/dir/config.json'
    );

    expect(result).toEqual({ name: 'test', value: 123 });
    expect(error).toBeUndefined();
  });
  it('should handle file not found errors', async () => {
    const { result } = await parseJson('/non/existent/file.json');

    expect(result).toBeNull();
  });
  it('should handle JSON parsing errors', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/invalid.json', '{invalid:json}');
    const { result } = await parseJson('/some/dir/invalid.json');

    expect(result).toBeNull();
  });
  it('should handle file read errors', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/config.json', '{"data":"test"}');
    const originalReadFileSync = fs.promises.readFile;
    fs.promises.readFile = vi.fn().mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const { result } = await parseJson('/some/dir/config.json');

    expect(result).toBeNull();

    fs.promises.readFile = originalReadFileSync;
  });
  it('should find and parse JSON file with explicit extension', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/config.json', '{"name":"test"}');

    const { result } = await parseJson('/some/dir', { fileName: 'config' });

    expect(result).toEqual({ name: 'test' });
  });
  it('should handle empty or malformed JSON data', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/empty.json', '');

    const { result } = await parseJson('/some/dir/empty.json');

    expect(result).toBeNull();
  });
  it('should respect the FindFileOpts parameter', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file(
      '/resolved/some/dir/custom.config.json',
      '{"custom":true}'
    );
    const { result } = await parseJson('/some/dir', {
      fileName: 'custom.config'
    });

    expect(result).toEqual({ custom: true });
  });
  it('should call resolver function if provided', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file(
      '/resolved/some/dir/config.json',
      '{"name":"test","value":123}'
    );

    const resolverFn = vi.fn((data) => ({ ...data, resolved: true }));

    const { result } = await parseJson('/some/dir/config.json', { resolverFn });

    expect(result).toEqual({ name: 'test', value: 123, resolved: true });
    expect(resolverFn).toHaveBeenCalledWith({ name: 'test', value: 123 });
    expect(resolverFn).toHaveBeenCalledTimes(1);
  });
  it('should return null if provided resolverFn returns null', async () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file(
      '/resolved/some/dir/config.json',
      '{"name":"test","value":123}'
    );
    const resolverFn = vi.fn(() => null);
    const { result } = await parseJson('/some/dir/config.json', { resolverFn });
    expect(result).toEqual(null);
  });
});
