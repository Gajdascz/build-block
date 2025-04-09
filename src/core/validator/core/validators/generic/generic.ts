import { Obj } from '#utils';
import * as Result from '../../result/result.js';
import type * as Types from '../../types/types.js';

export const exec = <T = unknown>(
  value: unknown,
  fieldName = '',
  cb: ((value: unknown) => Types.Result<T>) | ((value: unknown) => boolean)
) => {
  const result = cb(value);
  if (typeof result === 'boolean')
    return result ?
        Result.valid<T>(value as T, fieldName)
      : Result.invalid(value, fieldName);
  return result;
};

export const create =
  <T = unknown>(
    cb:
      | ((value: unknown, fieldName?: string) => Types.Result<T>)
      | ((value: unknown, fieldName?: string) => boolean)
  ) =>
  (v: unknown, fieldName = '') =>
    exec<T>(v, fieldName, cb);

export const obj = <T = unknown>(value: unknown, fieldName = '') =>
  exec<T>(value, fieldName, Obj.is<T>);

export const str = <T = string>(value: unknown, fieldName = '') =>
  exec<T>(value, fieldName, (v) => typeof v === 'string');

export const num = <T = number>(value: unknown, fieldName = '') =>
  exec<T>(value, fieldName, (v) => typeof v === 'number');

export const bool = <T>(value: unknown, fieldName = '') =>
  exec<T>(value, fieldName, (v) => typeof v === 'boolean');

export const arr = <T = unknown>(value: unknown, fieldName = '') =>
  exec<T[]>(value, fieldName, (v) => Array.isArray(v));

export const fn = <T = unknown>(value: unknown, fieldName = '') =>
  exec<T>(value, fieldName, (v) => typeof v === 'function');
