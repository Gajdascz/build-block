// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as _prompts from '#_prompts';
import { create } from '#config';
import * as Templates from '#templates';
import { file } from '#utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CFG_SLUG, getCwdWithSlug } from '../constants/constants';
import {
  resolveFilePath,
  resolveInput,
  resolvePackage,
  resolvePrompt
} from './resolver';

// Mock all external dependencies
vi.mock('#_prompts', () => ({
  init: {
    isReady: vi.fn(),
    configFilePath: vi.fn(),
    configProvider: vi.fn(),
    interactiveConfig: vi.fn()
  }
}));

vi.mock('#config', () => ({ create: { from: { unknown: vi.fn() } } }));

vi.mock('#templates', () => ({ load: vi.fn() }));

vi.mock('#utils', () => ({
  file: { parseJson: vi.fn(), loadModule: vi.fn(), findFile: vi.fn() }
}));

// Sample test data
const mockConfig = {
  core: { slug: 'test-block', namespace: 'test', title: 'Test Block' }
};

const mockTemplates = [{ id: 'template1' }, { id: 'template2' }];

const mockResolvedWithTemplates = {
  config: mockConfig,
  templates: mockTemplates
};

describe('Resolver Module', () => {
  beforeEach(() => {
    // Setup default mocks
    Templates.load.mockReturnValue(mockTemplates);
    create.from.unknown.mockReturnValue(mockConfig);
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  describe('Direct Input', () => {
    it('should resolve input and return config with templates', () => {
      const result = resolveInput({ core: mockConfig.core });

      expect(create.from.unknown).toHaveBeenCalledWith({
        core: mockConfig.core
      });
      expect(Templates.load).toHaveBeenCalledWith(mockConfig.core.slug);
      expect(result).toEqual(mockResolvedWithTemplates);
    });
    it('should throw an error when resolution fails', () => {
      create.from.unknown.mockImplementation(() => {
        throw new Error('Invalid configuration');
      });

      expect(() => resolveInput({})).toThrowError();
    });
  });
  describe('JSON Handler (through resolveFilePath)', () => {
    it('should throw error when JSON parsing fails', async () => {
      file.findFile.mockReturnValue({
        result: '/path/to/config.json',
        error: null
      });
      file.parseJson.mockResolvedValue({
        result: null,
        error: 'Invalid JSON format'
      });
      await expect(
        resolveFilePath('/path/to/config.json')
      ).rejects.toThrowError();
      expect(file.parseJson).toHaveBeenCalledWith(
        '/path/to/config.json',
        expect.objectContaining({ resolverFn: expect.any(Function) })
      );
    });
    it('should indirectly test the resolverFn for JSON files', async () => {
      let capturedResolverFn;
      file.findFile.mockReturnValue({
        result: '/path/to/config.json',
        error: null
      });
      file.parseJson.mockImplementation((path, options) => {
        capturedResolverFn = options.resolverFn;
        return Promise.resolve({
          result: mockResolvedWithTemplates,
          error: null
        });
      });
      await resolveFilePath('/path/to/config.json');
      expect(capturedResolverFn).toBeDefined();
      create.from.unknown.mockReturnValue(mockConfig);
      Templates.load.mockReturnValue(mockTemplates);
      const testInput = {
        core: { namespace: 'test', slug: 'test', title: 'Test' }
      };
      const resolverResult = capturedResolverFn(testInput);
      expect(resolverResult).toEqual(mockResolvedWithTemplates);
      create.from.unknown.mockImplementation(() => {
        throw new Error('Invalid configuration');
      });
      expect(() => capturedResolverFn({})).toThrowError();
    });
  });
  describe('Prompt', () => {
    it('should resolve configuration from prompts', async () => {
      _prompts.init.interactiveConfig.mockReturnValue(mockConfig);

      const result = await resolvePrompt();

      expect(_prompts.init.interactiveConfig).toHaveBeenCalled();
      expect(result).toEqual(mockResolvedWithTemplates);
    });
    it('should handle errors from prompts', async () => {
      _prompts.init.interactiveConfig.mockRejectedValue(
        new Error('Prompt error')
      );

      await expect(resolvePrompt()).rejects.toThrowError();
    });
    it('should handle non-Error objects from prompts', async () => {
      _prompts.init.interactiveConfig.mockRejectedValue('String error');
      await expect(resolvePrompt()).rejects.toThrowError();
    });
    it('should handle null result from prompts', async () => {
      _prompts.init.interactiveConfig.mockResolvedValue({
        result: null,
        error: 'User cancelled the operation'
      });
      await expect(resolvePrompt()).rejects.toThrowError(
        'User cancelled the operation'
      );
      expect(_prompts.init.interactiveConfig).toHaveBeenCalledWith(
        'recommended'
      );
    });
  });
  describe('Package', () => {
    it('should resolve configuration from package.json', async () => {
      file.parseJson.mockResolvedValue({
        result: mockResolvedWithTemplates,
        error: null
      });

      const result = await resolvePackage('./package.json');

      expect(file.parseJson).toHaveBeenCalledWith(
        './package.json',
        expect.any(Object)
      );
      expect(result).toEqual(mockResolvedWithTemplates);
    });
    it('should throw error when package.json parsing fails', async () => {
      file.parseJson.mockResolvedValue({
        result: null,
        error: 'File not found'
      });

      await expect(resolvePackage()).rejects.toThrowError();
    });
    it('should handle package.json without build-block property', async () => {
      let capturedResolverFn;
      file.parseJson.mockImplementation((path, options) => {
        capturedResolverFn = options.resolverFn;
        return Promise.resolve({
          result: mockResolvedWithTemplates,
          error: null
        });
      });
      await resolvePackage('./package.json');
      const packageWithoutProperty = { name: 'some-package', version: '1.0.0' };
      const result = capturedResolverFn(packageWithoutProperty);
      expect(result).toBeNull();
      const packageWithProperty = {
        name: 'some-package',
        version: '1.0.0',
        [CFG_SLUG]: { core: { namespace: 'test', slug: 'test', title: 'Test' } }
      };
      create.from.unknown.mockReturnValue(mockConfig);
      Templates.load.mockReturnValue(mockTemplates);
      const resultWithProperty = capturedResolverFn(packageWithProperty);
      expect(resultWithProperty).toEqual(mockResolvedWithTemplates);
      expect(create.from.unknown).toHaveBeenCalledWith(
        packageWithProperty[CFG_SLUG]
      );
    });
  });
  describe('FilePath', () => {
    beforeEach(() => {
      file.findFile.mockReturnValue({
        result: '/path/to/config.json',
        error: null
      });
      file.parseJson.mockResolvedValue({
        result: mockResolvedWithTemplates,
        error: null
      });
    });
    it('should resolve configuration from a JSON file', async () => {
      const result = await resolveFilePath('/path/to/config.json');

      expect(file.findFile).toHaveBeenCalledWith(
        '/path/to/config.json',
        expect.any(Object)
      );
      expect(file.parseJson).toHaveBeenCalledWith(
        '/path/to/config.json',
        expect.any(Object)
      );
      expect(result).toEqual(mockResolvedWithTemplates);
    });
    it('should resolve configuration from a TS file', async () => {
      file.findFile.mockReturnValue({
        result: '/path/to/config.ts',
        error: null
      });

      file.loadModule.mockResolvedValue({
        result: mockResolvedWithTemplates,
        error: null
      });

      const result = await resolveFilePath('/path/to/config.ts');

      expect(file.findFile).toHaveBeenCalledWith(
        '/path/to/config.ts',
        expect.any(Object)
      );
      expect(file.loadModule).toHaveBeenCalledWith(
        '/path/to/config.ts',
        expect.any(Object)
      );
      expect(result).toEqual(mockResolvedWithTemplates);
    });
    it('should resolve configuration from a JS file', async () => {
      file.findFile.mockReturnValue({
        result: '/path/to/config.js',
        error: null
      });
      file.loadModule.mockResolvedValue({
        result: mockResolvedWithTemplates,
        error: null
      });
      const result = await resolveFilePath('/path/to/config.js');
      expect(file.loadModule).toHaveBeenCalledWith(
        '/path/to/config.js',
        expect.any(Object)
      );
      expect(result).toEqual(mockResolvedWithTemplates);
    });
    it('should use default file path when none provided', async () => {
      await resolveFilePath();
      expect(file.findFile).toHaveBeenCalledWith(
        `${getCwdWithSlug()}.json`,
        expect.any(Object)
      );
    });
    it('should prompt for a new path when file not found', async () => {
      file.findFile.mockReturnValueOnce({
        result: null,
        error: 'File not found'
      });
      _prompts.init.configFilePath.mockResolvedValue({
        result: '/new/path/config.json',
        error: null
      });
      file.findFile.mockReturnValueOnce({
        result: '/new/path/config.json',
        error: null
      });
      await resolveFilePath();
      expect(_prompts.init.configFilePath).toHaveBeenCalled();
      expect(file.findFile).toHaveBeenCalledTimes(2);
    });
    it('should throw error when prompt for new path returns null', async () => {
      file.findFile.mockReturnValueOnce({
        result: null,
        error: 'File not found'
      });
      _prompts.init.configFilePath.mockResolvedValue({
        result: null,
        error: 'User cancelled'
      });
      await expect(resolveFilePath()).rejects.toThrowError();
    });
    it('should throw error when prompted path file not found', async () => {
      file.findFile.mockReturnValueOnce({
        result: null,
        error: 'File not found'
      });
      _prompts.init.configFilePath.mockResolvedValue({
        result: '/new/path/config.json',
        error: null
      });

      file.findFile.mockReturnValueOnce({
        result: null,
        error: 'File still not found'
      });
      await expect(resolveFilePath()).rejects.toThrowError();
    });
    it('should throw error for unsupported file extension', async () => {
      file.findFile.mockReturnValue({
        result: '/path/to/config.xyz',
        error: null
      });

      await expect(resolveFilePath()).rejects.toThrowError();
    });
  });
  describe('Module', () => {
    it('should throw an error when module loading fails', async () => {
      file.loadModule.mockResolvedValue({
        result: null,
        error: 'Module loading failed'
      });
      file.findFile.mockReturnValue({
        result: '/path/to/config.ts',
        error: null
      });
      await expect(
        resolveFilePath('/path/to/config.ts')
      ).rejects.toThrowError();
      expect(file.loadModule).toHaveBeenCalledWith(
        '/path/to/config.ts',
        expect.objectContaining({
          resolverFn: expect.any(Function),
          exportKey: 'config'
        })
      );
    });

    it('should test the resolverFn parameter passed to loadModule', async () => {
      let capturedResolverFn = null;
      file.loadModule.mockImplementation((path, options) => {
        capturedResolverFn = options.resolverFn;
        return Promise.resolve({
          result: mockResolvedWithTemplates,
          error: null
        });
      });
      file.findFile.mockReturnValue({
        result: '/path/to/config.ts',
        error: null
      });
      await resolveFilePath('/path/to/config.ts');
      expect(capturedResolverFn).toBeDefined();
      expect(typeof capturedResolverFn).toBe('function');
      const testConfig = {
        core: { title: 'Test', namespace: 'test', slug: 'test' }
      };
      create.from.unknown.mockReturnValue(testConfig);
      Templates.load.mockReturnValue([{ id: 'template-test' }]);
      const resolvedResult = capturedResolverFn(testConfig);
      expect(resolvedResult).toEqual({
        config: testConfig,
        templates: expect.any(Array)
      });
      create.from.unknown.mockImplementation(() => {
        throw new Error('Configuration validation failed');
      });
      expect(() => capturedResolverFn({})).toThrowError();
    });
  });
});
