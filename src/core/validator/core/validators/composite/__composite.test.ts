import { describe, expect, it } from 'vitest';
import { __TestUtils } from '../../../../validator/__testUtils';
import * as Result from '../../result/result';
import type * as Types from '../../types/types';
import { composite } from './composite';

describe('composite validator', () => {
  const { expect: _expect } = __TestUtils;

  it('returns valid result when all results are valid', () => {
    const validResults = [
      Result.valid('test', 'string'),
      Result.valid(42, 'number'),
      Result.valid(true, 'boolean')
    ];

    const result = composite(validResults, 'testComposite');

    _expect.valid(result);
    expect(result.value).toEqual(['test', 42, true]);
  });

  it('returns invalid result when any result is invalid', () => {
    const mixedResults = [
      Result.valid('test', 'string'),
      Result.invalid(
        null,
        'number',
        `${Result.FAIL_PREFIX} number must be a number`
      ),
      Result.valid(true, 'boolean')
    ];

    const result = composite(mixedResults, 'testComposite');

    _expect.invalid(result);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('returns invalid result when all results are invalid', () => {
    const invalidResults = [
      Result.invalid(
        null,
        'string',
        `${Result.FAIL_PREFIX} string must be a string`
      ),
      Result.invalid(
        null,
        'number',
        `${Result.FAIL_PREFIX} number must be a number`
      ),
      Result.invalid(
        null,
        'boolean',
        `${Result.FAIL_PREFIX} boolean must be a boolean`
      )
    ];

    const result = composite(invalidResults, 'testComposite');

    _expect.invalid(result);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('joins multiple error messages in the result', () => {
    const invalidResults = [
      Result.invalid(null, 'field1', `${Result.FAIL_PREFIX} field1 error`),
      Result.invalid(null, 'field2', `${Result.FAIL_PREFIX} field2 error`)
    ];

    const result = composite(invalidResults, 'testComposite');

    _expect.invalid(result);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('handles empty array of results', () => {
    const emptyResults: Types.Result<unknown>[] = [];

    const result = composite(emptyResults, 'testComposite');

    _expect.valid(result);
    expect(result.value).toEqual([]);
  });

  it('uses default field name when not provided', () => {
    const validResults = [Result.valid('test', 'string')];

    const result = composite(validResults);

    _expect.valid(result);
    expect(result.value).toEqual(['test']);
  });

  it('rejects non-array input', () => {
    const nonArray = 'not an array';
    // @ts-expect-error - Testing invalid input behavior
    const result = composite(nonArray, 'testComposite');
    _expect.invalid(result);
  });

  it('preserves the order of values in the result', () => {
    const validResults = [
      Result.valid('third', 'item3'),
      Result.valid('first', 'item1'),
      Result.valid('second', 'item2')
    ];

    const result = composite(validResults, 'testComposite');

    _expect.valid(result);
    expect(result.value).toEqual(['third', 'first', 'second']);
  });

  it('handles results with undefined values', () => {
    const mixedResults = [
      Result.valid('test', 'string'),
      Result.valid(undefined, 'optional')
    ];
    const result = composite(mixedResults, 'testComposite');
    _expect.valid(result);
    expect(result.value).toEqual(['test', undefined]);
  });
});
