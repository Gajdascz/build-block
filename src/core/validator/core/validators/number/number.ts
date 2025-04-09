import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import type { Bounds, Validator } from '../../types/types.js';

export const number: Validator<
  number,
  {
    allow: {
      infinity: boolean;
      nan: boolean;
      negative: boolean;
      positive: boolean;
      stringConversion: boolean;
    };
    bounds: Bounds;
    mustMatch: number;
  }
> = (
  value,
  fieldName = 'Number',
  { allow = {}, bounds = {}, mustMatch } = {}
) => {
  const {
    nan = false,
    infinity = true,
    negative = true,
    positive = true,
    stringConversion = false
  } = allow;
  const { max = Infinity, min = -Infinity } = bounds;
  const invalid = (message: string) =>
    Result.invalid(value, fieldName, message);
  if (!negative && !positive)
    return invalid(Msgs.mustBe._('either positive or negative'));
  if (min > max)
    return invalid(`Min value ${min} is greater than max value ${max}`);
  const _num =
    typeof value === 'number' ? value
    : stringConversion && typeof value === 'string' ? Number(value)
    : null;
  if (typeof _num !== 'number') return invalid(Msgs.mustBe.aNumber());
  if (mustMatch !== undefined && _num === mustMatch)
    return Result.valid(_num, fieldName);
  if (!infinity && !Number.isFinite(_num))
    return invalid(Msgs.mustBe.aFiniteNum());
  if (!nan && Number.isNaN(_num)) return invalid(Msgs.mustBe.notNaN());
  if (!negative && positive && _num < 0)
    return invalid(Msgs.mustBe.aPositiveNum());
  if (!positive && negative && _num > 0)
    return invalid(Msgs.mustBe.aNegativeNum());
  if (_num < min) return invalid(Msgs.mustBe.atLeast(min.toString()));
  if (_num > max) return invalid(Msgs.mustBe.atMost(max.toString()));
  return Result.valid(_num, fieldName);
};
