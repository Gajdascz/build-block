import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../../validator/__testUtils';
import * as Result from '../../result/result';
import type * as Types from '../../types/types.js';
import * as Validators from '../index';
import { create } from './object';

const { expect: _expect } = __TestUtils;

describe('create', () => {
  it('validates objects with required properties', () => {
    interface Profile {
      name: string;
      age: number;
    }

    const validator = create<Profile>({
      requiredPropKeys: ['name', 'age'],
      validators: { name: Validators.string, age: Validators.number }
    });

    const validResult = validator({ name: 'John', age: 30 }, 'profile');
    _expect.valid(validResult);
    expect(validResult.value).toEqual({ name: 'John', age: 30 });

    const missingPropResult = validator({ name: 'John' }, 'profile');
    _expect.invalid(missingPropResult);

    const wrongTypeResult = validator({ name: 'John', age: '30' }, 'profile');
    _expect.invalid(wrongTypeResult);
  });

  it('validates objects with optional properties', () => {
    interface Profile {
      name: string;
      bio?: string;
    }

    const validator = create<Profile>({
      requiredPropKeys: ['name'],
      optionalPropKeys: ['bio'],
      validators: { name: Validators.string, bio: Validators.string }
    });

    const validWithOptionalResult = validator(
      { name: 'John', bio: 'Developer' },
      'profile'
    );
    _expect.valid(validWithOptionalResult);
    expect(validWithOptionalResult.value).toEqual({
      name: 'John',
      bio: 'Developer'
    });

    const validWithoutOptionalResult = validator({ name: 'John' }, 'profile');
    _expect.valid(validWithoutOptionalResult);
    expect(validWithoutOptionalResult.value).toEqual({ name: 'John' });

    const invalidOptionalTypeResult = validator(
      { name: 'John', bio: 123 },
      'profile'
    );
    _expect.invalid(invalidOptionalTypeResult);
  });

  it('validates nested objects', () => {
    interface Address {
      street: string;
      city: string;
      zipCode: string;
    }

    interface Profile {
      name: string;
      address: Address;
    }

    const addressValidator = create<Address>({
      requiredPropKeys: ['street', 'city', 'zipCode'],
      validators: {
        street: Validators.string,
        city: Validators.string,
        zipCode: Validators.string
      }
    });

    const profileValidator = create<Profile>({
      requiredPropKeys: ['name', 'address'],
      validators: { name: Validators.string, address: addressValidator }
    });

    const validResult = profileValidator(
      {
        name: 'John',
        address: { street: '123 Main St', city: 'Anytown', zipCode: '12345' }
      },
      'profile'
    );

    _expect.valid(validResult);
    expect(validResult.value).toEqual({
      name: 'John',
      address: { street: '123 Main St', city: 'Anytown', zipCode: '12345' }
    });

    const invalidNestedResult = profileValidator(
      {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown'
          // Missing zipCode
        }
      },
      'profile'
    );

    _expect.invalid(invalidNestedResult);
  });

  it('validates objects with no required properties', () => {
    interface Options {
      debug?: boolean;
      timeout?: number;
    }

    const validator = create<Options>({
      optionalPropKeys: ['debug', 'timeout'],
      validators: { debug: Validators.boolean, timeout: Validators.number }
    });

    const validEmptyResult = validator({}, 'options');
    _expect.valid(validEmptyResult);
    expect(validEmptyResult.value).toEqual({});

    const validPartialResult = validator({ debug: true }, 'options');
    _expect.valid(validPartialResult);
    expect(validPartialResult.value).toEqual({ debug: true });

    const validFullResult = validator(
      { debug: true, timeout: 1000 },
      'options'
    );
    _expect.valid(validFullResult);
    expect(validFullResult.value).toEqual({ debug: true, timeout: 1000 });

    const invalidTypeResult = validator({ debug: 'yes' }, 'options');
    _expect.invalid(invalidTypeResult);
  });

  it('handles non-object values correctly', () => {
    const validator = create<{ name: string }>({
      requiredPropKeys: ['name'],
      validators: { name: Validators.string }
    });

    const nullResult = validator(null, 'data');
    _expect.invalid(nullResult);

    const undefinedResult = validator(undefined, 'data');
    _expect.invalid(undefinedResult);

    const numberResult = validator(42, 'data');
    _expect.invalid(numberResult);

    const stringResult = validator('not an object', 'data');
    _expect.invalid(stringResult);

    const arrayResult = validator(['not', 'an', 'object'], 'data');
    _expect.invalid(arrayResult);
  });

  it('validates custom object validators', () => {
    interface Range {
      min: number;
      max: number;
    }

    const rangeValidator = create<Range>({
      requiredPropKeys: ['min', 'max'],
      validators: { min: Validators.number, max: Validators.number }
    });

    // Additional custom validation function
    const validateRange = (
      value: unknown,
      fieldName: string
    ): Types.Result<Range | null> => {
      // First validate it's a proper Range object
      const rangeResult = rangeValidator(value, fieldName);
      if (rangeResult.value === null) return rangeResult;

      // Then check the business rule that max > min
      const range = rangeResult.value;
      if (range.max <= range.min) {
        return Result.invalid(
          value,
          fieldName,
          `${Result.FAIL_PREFIX} ${fieldName}: max must be greater than min`
        );
      }

      return Result.valid(range, fieldName);
    };

    const validResult = validateRange({ min: 1, max: 10 }, 'range');
    _expect.valid(validResult);
    expect(validResult.value).toEqual({ min: 1, max: 10 });

    const invalidRangeResult = validateRange({ min: 10, max: 5 }, 'range');
    _expect.invalid(invalidRangeResult);

    const missingPropResult = validateRange({ min: 1 }, 'range');
    _expect.invalid(missingPropResult);
  });
});
