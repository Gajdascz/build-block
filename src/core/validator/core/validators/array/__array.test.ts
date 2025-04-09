import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../../validator/__testUtils';
import type { Types } from '../../index';
import * as Validators from '../index';
import { create } from './array';

const { expect: _expect } = __TestUtils;

describe('create', () => {
  describe('basic array validation', () => {
    it('creates a validator that rejects non-array values', () => {
      const arrayValidator = create();
      const fieldName = 'testArray';
      const invalidValues = [
        null,
        undefined,
        123,
        'string',
        {},
        new Set(),
        new Map(),
        () => undefined
      ];

      invalidValues.forEach((value) => {
        const result = arrayValidator(value, fieldName);
        _expect.invalid(result);
      });
    });

    it('creates a validator that accepts array values', () => {
      const arrayValidator = create();
      const fieldName = 'testArray';

      const result = arrayValidator(['a', 'b'], fieldName);

      _expect.valid(result);
      expect(result.value).toEqual(['a', 'b']);
    });
  });

  describe('empty array validation', () => {
    it('creates a validator that rejects empty arrays by default', () => {
      const arrayValidator = create();
      const fieldName = 'testArray';

      const result = arrayValidator([], fieldName);

      _expect.invalid(result);
    });

    it('creates a validator that accepts empty arrays when allowEmpty is true', () => {
      const arrayValidator = create(undefined, { allowEmpty: true });
      const fieldName = 'testArray';

      const result = arrayValidator([], fieldName);

      _expect.valid(result);
      expect(result.value).toEqual([]);
    });
  });

  describe('bounds validation', () => {
    it('creates a validator that rejects arrays smaller than min bound', () => {
      const arrayValidator = create(undefined, { bounds: { min: 2 } });
      const fieldName = 'testArray';

      const result = arrayValidator([1], fieldName);

      _expect.invalid(result);
    });

    it('creates a validator that rejects arrays larger than max bound', () => {
      const arrayValidator = create(undefined, { bounds: { max: 2 } });
      const fieldName = 'testArray';

      const result = arrayValidator([1, 2, 3], fieldName);

      _expect.invalid(result);
    });

    it('creates a validator that accepts arrays within bounds', () => {
      const arrayValidator = create(undefined, { bounds: { min: 1, max: 3 } });
      const fieldName = 'testArray';

      const result = arrayValidator([1, 2], fieldName);

      _expect.valid(result);
      expect(result.value).toEqual([1, 2]);
    });
  });

  describe('item validation', () => {
    it('creates a validator that validates each item using the provided item validator', () => {
      const arrayValidator = create(Validators.number);
      const fieldName = 'numbers';

      const validResult = arrayValidator([1, 2, 3], fieldName);

      _expect.valid(validResult);
      expect(validResult.value).toEqual([1, 2, 3]);

      const invalidResult = arrayValidator([1, 'not a number', 3], fieldName);

      _expect.invalid(invalidResult);
    });
  });

  describe('complex validations', () => {
    it('combines multiple validation rules correctly', () => {
      const numberArrayValidator = create(Validators.number, {
        allowEmpty: false,
        bounds: { min: 2, max: 4 }
      });
      const fieldName = 'scores';

      const validResult = numberArrayValidator([10, 20, 30], fieldName);
      _expect.valid(validResult);

      const emptyResult = numberArrayValidator([], fieldName);
      _expect.invalid(emptyResult);

      const tooFewResult = numberArrayValidator([10], fieldName);
      _expect.invalid(tooFewResult);

      const tooManyResult = numberArrayValidator(
        [10, 20, 30, 40, 50],
        fieldName
      );
      _expect.invalid(tooManyResult);

      const invalidItemResult = numberArrayValidator(
        [10, 'twenty', 30],
        fieldName
      );
      _expect.invalid(invalidItemResult);
    });
  });

  describe('type safety', () => {
    it('maintains type information correctly', () => {
      // These tests verify the type safety at compile time
      // The assertions are just to make sure the test runs

      // String array validator
      const stringArrayValidator = create<string>(Validators.string);
      const stringResult = stringArrayValidator(['a', 'b'], 'strings');
      _expect.valid(stringResult);

      // Number array validator
      const numberArrayValidator = create<number>(Validators.number);
      const numberResult = numberArrayValidator([1, 2], 'numbers');
      _expect.valid(numberResult);

      // Boolean array validator
      const booleanArrayValidator = create<boolean>(Validators.boolean);
      const booleanResult = booleanArrayValidator([true, false], 'flags');
      _expect.valid(booleanResult);
    });
  });

  describe('custom validators', () => {
    it('works with custom item validators', () => {
      const positiveNumberValidator: Types.Validator<number> = (
        value,
        fieldName = 'PositiveNumber'
      ) => {
        if (typeof value !== 'number') {
          return { value: null, message: `${fieldName} must be a number` };
        }
        if (value <= 0) {
          return { value: null, message: `${fieldName} must be positive` };
        }
        return { value, message: 'Valid positive number' };
      };

      const positiveNumberArrayValidator = create(positiveNumberValidator);

      const validResult = positiveNumberArrayValidator(
        [1, 2, 3],
        'positiveNumbers'
      );
      _expect.valid(validResult);

      const negativeNumberResult = positiveNumberArrayValidator(
        [1, -2, 3],
        'positiveNumbers'
      );
      _expect.invalid(negativeNumberResult);
    });
  });
});
