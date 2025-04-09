import { cleanStringArray, join } from '#utils';
import type { Result } from '../types/types.js';
const PASS_PREFIX = '[✅ Passed]';
const FAIL_PREFIX = '[❌ Failed]';
const invalid = (
  value: unknown,
  fieldName: string,
  errorDesc?: string
): Result<null> => ({
  value: null,
  message: join.affix(
    `(${fieldName})`,
    FAIL_PREFIX,
    `${errorDesc ?? ''}\nReceived: ${JSON.stringify(value, null, 2)}`
  )
});

const valid = <T>(value: T, fieldName: string, message = ''): Result<T> => ({
  value,
  message: join.post(`${PASS_PREFIX}(${fieldName})`, message)
});

const partition = (results: Result<unknown>[]) =>
  results.reduce<{ valid: Result<unknown>[]; invalid: Result<null>[] }>(
    (acc, r) => {
      if (r.value === null) acc.invalid.push(r as Result<null>);
      else acc.valid.push(r);
      return acc;
    },
    { valid: [], invalid: [] }
  );
const joinMessages = (results: Result<unknown>[]) =>
  results.length === 0 ?
    ''
  : cleanStringArray(results.map((res) => res.message.trim()))
      .join('\n')
      .trim();

export { FAIL_PREFIX, invalid, joinMessages, partition, PASS_PREFIX, valid };
