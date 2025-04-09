import * as Msgs from '../../messages/index.js';
import * as Result from '../../result/result.js';
import type * as Types from '../../types/types.js';

export const composite = <T = unknown>(
  results: Types.Result<unknown>[],
  fieldName = ''
): Types.Result<T[] | null> => {
  const invalid = (message: string) => Result.invalid(null, fieldName, message);

  if (!Array.isArray(results)) return invalid(Msgs.mustBe.anArray());

  const { invalid: _invalid, valid } = Result.partition(results);
  return _invalid.length ?
      invalid(Result.joinMessages(_invalid))
    : Result.valid(
        valid.map((r) => r.value as T),
        fieldName
      );
};
