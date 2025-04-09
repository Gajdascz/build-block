import { Validator } from '#validator';
import { describe, expect, it } from 'vitest';
import { createConfigModule } from './config-module-factory.js';

describe('createConfigModule', () => {
  // Helper function to create a sample config module for tests
  function createSampleConfigModule() {
    const _static = { version: '1.0.0' };
    const defaults = { theme: 'light', timeout: 1000 };
    const requiredPropKeys = ['name', 'enabled'] as const;

    const validators = {
      name: Validator.string,
      enabled: Validator.boolean,
      theme: Validator.string,
      timeout: Validator.number,
      version: Validator.string
    } as const;

    return createConfigModule({
      moduleName: 'testModule',
      _static,
      defaults,
      validators,
      requiredPropKeys
    });
  }

  it('creates a config module with correct structure', () => {
    const module = createSampleConfigModule();

    // Check data structure
    expect(module.data).toEqual({
      moduleName: 'testModule',
      static: { version: '1.0.0' },
      defaults: { theme: 'light', timeout: 1000 },
      keys: {
        requiredInput: ['name', 'enabled'],
        optionalInput: ['theme', 'timeout'],
        static: ['version'],
        all: ['name', 'enabled', 'theme', 'timeout', 'version'],
        input: ['name', 'enabled', 'theme', 'timeout']
      }
    });

    // Check operations existence
    expect(module.ops.resolve.input).toBeTypeOf('function');
    expect(module.ops.resolve.withValidation.unknownInput).toBeTypeOf(
      'function'
    );
    expect(module.ops.resolve.withValidation.typedInput).toBeTypeOf('function');
    expect(module.ops.validate.inputConfig).toBeTypeOf('function');
    expect(module.ops.validate.resolvedConfig).toBeTypeOf('function');
    expect(module.ops.validate.prop).toEqual(expect.any(Object));
  });

  it('resolves config correctly without inputResolveHelper', () => {
    const module = createSampleConfigModule();

    const input = { name: 'test', enabled: true, theme: 'dark' };

    const resolved = module.ops.resolve.input(input);

    expect(resolved.value).toEqual({
      name: 'test',
      enabled: true,
      theme: 'dark',
      timeout: 1000,
      version: '1.0.0'
    });
  });
  it('resolves config correctly with inputResolveHelper', () => {
    const module = createConfigModule({
      moduleName: 'testModule',
      _static: { version: '1.0.0' },
      defaults: { theme: 'light', timeout: 1000 },
      validators: {
        name: Validator.string,
        enabled: Validator.boolean,
        theme: Validator.string,
        timeout: Validator.number,
        version: Validator.string
      },
      requiredPropKeys: ['name', 'enabled'] as const,
      inputResolveHelper: (input, defaults, _static) => ({
        ...defaults,
        ...input,
        theme: input.theme ?? 'defaultTheme',
        ..._static
      })
    });

    const input = { name: 'test', enabled: true, theme: 'dark' };

    const resolved = module.ops.resolve.input(input);

    expect(resolved.value).toEqual({
      name: 'test',
      enabled: true,
      theme: 'dark',
      timeout: 1000,
      version: '1.0.0'
    });
  });

  it('validates and resolves unknown input correctly', () => {
    const module = createSampleConfigModule();

    const validInput = { name: 'test', enabled: true, theme: 'dark' };

    const result = module.ops.resolve.withValidation.unknownInput(validInput);

    expect(result.value).toEqual({
      name: 'test',
      enabled: true,
      theme: 'dark',
      timeout: 1000,
      version: '1.0.0'
    });
  });

  it('returns invalid result for invalid unknown input', () => {
    const module = createSampleConfigModule();

    const invalidInput = {
      // Missing required 'name' and 'enabled' properties
      theme: 'dark'
    };

    const result = module.ops.resolve.withValidation.unknownInput(invalidInput);

    expect(result.value).toBeNull();
    expect(result.message).toBeTruthy();
  });

  it('validates and resolves typed input correctly', () => {
    const module = createSampleConfigModule();

    const input = { name: 'test', enabled: true, theme: 'dark' };

    const result = module.ops.resolve.withValidation.typedInput(input);

    expect(result.value).toEqual({
      name: 'test',
      enabled: true,
      theme: 'dark',
      timeout: 1000,
      version: '1.0.0'
    });
  });

  it('validates input configuration directly', () => {
    const module = createSampleConfigModule();

    const validInput = { name: 'test', enabled: true };

    const result = module.ops.validate.inputConfig(validInput);

    expect(result.value).toEqual(validInput);
  });

  it('validates resolved configuration directly', () => {
    const module = createSampleConfigModule();

    const resolved = {
      name: 'test',
      enabled: true,
      theme: 'dark',
      timeout: 1000,
      version: '1.0.0'
    };

    const result = module.ops.validate.resolvedConfig(resolved);

    expect(result.value).toEqual(resolved);
  });

  it('exposes property validators for individual validation', () => {
    const module = createSampleConfigModule();

    const nameResult = module.ops.validate.prop.name('testName');
    const enabledResult = module.ops.validate.prop.enabled(true);

    expect(nameResult.value).toBe('testName');
    expect(enabledResult.value).toBe(true);
  });
});
