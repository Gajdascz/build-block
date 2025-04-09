import { beforeEach } from 'node:test';
import { describe, expect, it, vi } from 'vitest';
import { utils } from '../../../../../__mocks__/index.js';
import { loadModule } from './loadModule.js';

vi.mock('jiti', () => {
  const mockImportFn = vi.fn();
  return {
    createJiti: vi.fn(() => ({ import: mockImportFn })),
    __mockImportFn: mockImportFn
  };
});

//@ts-expect-error Mocked import does expose this fn for testing
const { __mockImportFn: mockImportFn } = vi.mocked(await import('jiti'), true);

describe('loadModule', () => {
  utils.beforeAfterEach();
  beforeEach(() => {
    mockImportFn.mockClear();
  });
  it('should load a module with a default export', async () => {
    const configPath = '/test/config.js';
    const mockData = { default: { name: 'test', value: 42 } };
    mockImportFn.mockResolvedValueOnce(mockData);
    const result = await loadModule(configPath);
    expect(mockImportFn).toHaveBeenCalledWith(configPath);
    expect(result.result).toEqual({ name: 'test', value: 42 });
  });

  it('should load a module with a named export using the default key', async () => {
    const configPath = '/test/config-named.js';
    const mockData = { config: { name: 'named-export', value: 123 } };

    mockImportFn.mockResolvedValueOnce(mockData);

    const result = await loadModule(configPath);

    expect(mockImportFn).toHaveBeenCalledWith(configPath);
    expect(result.result).toEqual({ name: 'named-export', value: 123 });
  });

  it('should load a module with a custom export key', async () => {
    const configPath = '/test/custom-key.js';
    const mockData = { settings: { name: 'custom-key', value: 'custom' } };
    mockImportFn.mockResolvedValueOnce(mockData);
    const result = await loadModule(configPath, { exportKey: 'settings' });
    expect(mockImportFn).toHaveBeenCalledWith(configPath);
    expect(result.result).toMatchObject(mockData.settings);
  });

  it('should load a module with a function export', async () => {
    const configPath = '/test/function-export.js';
    const mockData = {
      default: () => ({ name: 'function-export', value: 100 })
    };
    mockImportFn.mockResolvedValueOnce(mockData);
    const result = await loadModule(configPath);
    expect(result.result).toEqual({ name: 'function-export', value: 100 });
  });

  it('should load a module with a function that returns a promise', async () => {
    const configPath = '/test/promise-function.js';
    const mockData = {
      default: () => Promise.resolve({ name: 'promise-function', value: 200 })
    };
    mockImportFn.mockResolvedValueOnce(mockData);
    const result = await loadModule(configPath);
    expect(result.result).toEqual({ name: 'promise-function', value: 200 });
  });

  it('should load a module with the entire module as config', async () => {
    const configPath = '/test/module-as-config.js';
    const mockData = {
      defaults: { field1: 'value1', field2: 'value2' },
      otherField: 'field'
    };
    mockImportFn.mockResolvedValueOnce(mockData);

    const result = await loadModule(configPath);

    expect(result.result).toEqual(mockData);
  });

  it('should apply the resolver function if provided', async () => {
    const configPath = '/test/with-resolver.js';
    const mockData = { default: { base: 'config', count: 10 } };
    mockImportFn.mockResolvedValueOnce(mockData);
    const resolverFn = vi.fn((config) => {
      return { ...config, modified: true, count: config.count * 2 };
    });

    const result = await loadModule(configPath, { resolverFn });

    expect(resolverFn).toHaveBeenCalledWith({ base: 'config', count: 10 });
    expect(result.result).toEqual({
      base: 'config',
      count: 20,
      modified: true
    });
  });
  it('should throw error if resolver function returns null', async () => {
    const configPath = '/test/invalid-resolver.js';
    const mockData = { default: { base: 'config', count: 10 } };
    mockImportFn.mockResolvedValueOnce(mockData);
    const resolverFn = vi.fn(() => null);
    const result = await loadModule(configPath, { resolverFn });
    expect(resolverFn).toHaveBeenCalledWith({ base: 'config', count: 10 });
    expect(result.result).toBeNull();
  });
  it('should handle import errors', async () => {
    const configPath = '/nonexistent/config.js';

    mockImportFn.mockRejectedValueOnce(new Error('Module not found'));

    const result = await loadModule(configPath);

    expect(mockImportFn).toHaveBeenCalledWith(configPath);
    expect(result.result).toBeNull();
    expect(result.error).toContain('Failed to load script config');
    expect(result.error).toContain('Module not found');
  });
  it('should handle invalid exported value', async () => {
    const configPath = '/test/invalid-export.js';
    utils.mockImport(configPath, { default: 5 });

    const result = await loadModule(configPath);

    expect(result.result).toBeNull();
    expect(result.error).toContain('Failed to load script config');
  });
  it('should handle empty module', async () => {
    const configPath = '/test/empty-module.js';
    utils.mockImport(configPath, {});
    const result = await loadModule(configPath);
    expect(result.result).toBeNull();
  });
});
