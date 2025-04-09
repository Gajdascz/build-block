import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import type * as Types from '../../types/types.js';

export const boolean: Types.Validator<
  boolean,
  {
    allowStringConversion?: boolean;
    allowBooleanObject?: boolean;
    mustBe?: boolean;
  }
> = (
  value: unknown,
  fieldName = 'Boolean',
  {
    allowStringConversion = false,
    allowBooleanObject = false,
    mustBe = undefined
  } = {}
) => {
  const invalid = (message: string) =>
    Result.invalid(value, fieldName, message);
  let bool: boolean | undefined = undefined;
  if (typeof value === 'boolean') bool = value;
  // return Result.valid(value, fieldName);
  else if (allowStringConversion && typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'true') bool = true;
    else if (normalized === 'false') bool = false;
  } else if (allowBooleanObject && value instanceof Boolean)
    bool = value.valueOf();
  if (typeof bool === 'undefined') return invalid(Msgs.mustBe.aBoolean());
  if (typeof mustBe === 'boolean' && bool !== mustBe)
    return invalid(`Value is a boolean but must be ${mustBe}`);
  return Result.valid(bool, fieldName);
};
