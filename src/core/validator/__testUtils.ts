import { expect } from 'vitest';
import { Result } from './core/index';

const _expect = {
  valid: (result: any) => {
    expect(result?.value).not.toBe(null);
    expect(result?.message).toContain(Result.PASS_PREFIX);
  },
  invalid: (result: any) => {
    expect(result?.value).toBe(null);
    expect(result?.message).toContain(Result.FAIL_PREFIX);
  }
};

export const __TestUtils = { expect: _expect } as const;
