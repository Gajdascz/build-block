import { describe, expect, it } from 'vitest';
import { LIMITS, VERSIONS } from '../../constants/index.js';
import { __TestUtils } from '../../validator/__testUtils';
import * as Php from './php.types';
const { expect: _expect } = __TestUtils;
describe('php.types module', () => {
  describe('Php.ops.validate.prop validators', () => {
    describe('version validator', () => {
      it('should validate PHP version', () => {
        const validVersion = VERSIONS.php;
        const invalidVersion = '0.0';

        _expect.valid(Php.ops.validate.prop.version(validVersion));
        _expect.invalid(Php.ops.validate.prop.version(invalidVersion));
        _expect.invalid(Php.ops.validate.prop.version('not-a-version'));
      });
    });

    describe('classScope validator', () => {
      it('should validate class scope with minimum length', () => {
        const tooShort = 'a'.repeat(LIMITS.min.namespace - 1);
        const longEnough = 'a'.repeat(LIMITS.min.namespace);

        _expect.invalid(Php.ops.validate.prop.classScope(tooShort));
        _expect.valid(Php.ops.validate.prop.classScope(longEnough));
      });

      it('should reject non-string values', () => {
        _expect.invalid(Php.ops.validate.prop.classScope(123));
        _expect.invalid(Php.ops.validate.prop.classScope(null));
        _expect.invalid(Php.ops.validate.prop.classScope(undefined));
        _expect.invalid(Php.ops.validate.prop.classScope({}));
      });
    });

    describe('methodScope validator', () => {
      it('should validate method scope with minimum length', () => {
        const tooShort = 'a'.repeat(LIMITS.min.namespace - 1);
        const longEnough = 'a'.repeat(LIMITS.min.namespace);

        _expect.invalid(Php.ops.validate.prop.methodScope(tooShort));
        _expect.valid(Php.ops.validate.prop.methodScope(longEnough));
      });

      it('should reject non-string values', () => {
        _expect.invalid(Php.ops.validate.prop.methodScope(123));
        _expect.invalid(Php.ops.validate.prop.methodScope(null));
        _expect.invalid(Php.ops.validate.prop.methodScope(undefined));
        _expect.invalid(Php.ops.validate.prop.methodScope({}));
      });
    });
  });

  describe('Php.ops.validate.inputConfig validator', () => {
    it('should validate proper input objects', () => {
      const validInput = {
        classScope: 'ValidClass',
        methodScope: 'validMethod'
      };

      _expect.valid(Php.ops.validate.inputConfig(validInput));
    });

    it('should reject non-object inputs', () => {
      _expect.invalid(Php.ops.validate.inputConfig('string'));
      _expect.invalid(Php.ops.validate.inputConfig(123));
      _expect.invalid(Php.ops.validate.inputConfig(null));
      _expect.invalid(Php.ops.validate.inputConfig(undefined));
    });

    it('should composite validation results', () => {
      const invalidInput = {
        classScope: 'a', // too short
        methodScope: 'b' // too short
      };

      const result = Php.ops.validate.inputConfig(invalidInput);
      _expect.invalid(result);
    });
  });

  describe('resolve', () => {
    it('should use provided values when available', () => {
      const input = { classScope: 'CustomClass', methodScope: 'customMethod' };

      const resolved = Php.ops.resolve.input(input).value;

      expect(resolved).toEqual({
        classScope: 'CustomClass',
        methodScope: 'customMethod',
        version: VERSIONS.php
      });
    });

    it('should merge static properties', () => {
      const input = { classScope: 'Class', methodScope: 'Method' };
      const resolved = Php.ops.resolve.input(input).value;
      expect(resolved).toEqual({
        classScope: 'Class',
        methodScope: 'Method',
        version: VERSIONS.php
      });
    });
  });
});
