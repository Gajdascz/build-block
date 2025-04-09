import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import { type Url, type Validator, is } from '../../types/types.js';

export const url: Validator<Url | '', { allowEmpty: boolean }> = (
  value,
  fieldName = 'Url',
  { allowEmpty = false } = {}
) => {
  if (typeof value !== 'string')
    return Result.invalid(value, fieldName, Msgs.mustBe.aString());
  if (is.empty.string(value))
    return allowEmpty ?
        Result.valid(value, fieldName)
      : Result.invalid(value, fieldName, Msgs.mustBe.notEmpty());
  if (!is.url(value))
    return Result.invalid(value, fieldName, Msgs.mustBe.aUrl());

  return Result.valid(value, fieldName);
};
