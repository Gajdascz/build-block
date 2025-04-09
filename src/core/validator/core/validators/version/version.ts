import * as Msgs from '../../messages/index.js';
import * as Result from '../../result/result.js';
import { type Validator, type Version, is } from '../../types/types.js';

export const version: Validator<Version | null, { mustMatch?: Version }> = (
  value,
  fieldName = 'Version',
  { mustMatch } = {}
) => {
  const invalid = (message: string) =>
    Result.invalid(value, fieldName, message);
  if (typeof value !== 'string') return invalid(Msgs.mustBe.aString());
  if (is.empty.string(value)) return invalid(Msgs.mustBe.notEmpty());
  if (!is.version(value)) return invalid(Msgs.mustBe.aSemver());
  if (mustMatch && value !== mustMatch) return invalid(Msgs.mustBe.aSemver());
  return Result.valid(value, fieldName);
};
