import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import { type Bounds, type Validator, is } from '../../types/types.js';

export const string: Validator<
  string,
  {
    allowEmpty: boolean;
    bounds: Bounds;
    pattern: RegExp;
    shouldPass: (...args: any[]) => boolean;
  }
> = (
  value: unknown,
  fieldName = 'String',
  {
    allowEmpty = false,
    bounds: { max = Infinity, min = 1 } = {},
    pattern,
    shouldPass = undefined
  } = {}
) => {
  const invalid = (message: string) =>
    Result.invalid(value, fieldName, message);
  if (typeof value !== 'string') return invalid(Msgs.mustBe.aString());

  if (is.empty.string(value))
    return allowEmpty ?
        Result.valid(value, 'fieldName')
      : invalid(Msgs.mustBe.notEmpty());

  if (value.length < min)
    return invalid(Msgs.mustBe.atLeast(fieldName, min.toString()));
  if (value.length > max)
    return invalid(Msgs.mustBe.atMost(fieldName, max.toString()));
  if (pattern !== undefined && !(pattern as RegExp).test(value))
    return invalid(`${fieldName} must match the pattern ${pattern.source}`);
  if (shouldPass && !(shouldPass as (...args: any[]) => boolean)(value))
    return invalid(`${fieldName} must pass the custom validation`);
  return Result.valid(value, fieldName);
};
