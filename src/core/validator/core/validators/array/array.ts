import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import * as Types from '../../types/types.js';
import { composite } from '../composite/composite.js';

export interface ArrayValidatorOpts {
  allowEmpty: boolean;
  bounds: Partial<Types.Bounds>;
}
export const create = <T>(
  itemValidator?: Types.Validator<T>,
  opts: Partial<ArrayValidatorOpts> = {}
): Types.Validator<T[], ArrayValidatorOpts> => {
  const { allowEmpty: _allowEmpty = false, bounds: _bounds } = opts;
  const _min = _bounds?.min ?? 0;
  const _max = _bounds?.max ?? Infinity;

  return (
    value: unknown,
    fieldName = 'Array',
    { allowEmpty = _allowEmpty, bounds = {} } = {}
  ): Types.Result<T[] | null> => {
    const { min = _min, max = _max } = bounds;
    const invalid = (message: string) =>
      Result.invalid(value, fieldName, message);

    if (!Array.isArray(value)) return invalid(Msgs.mustBe.anArray());

    const valid = () => Result.valid(value, fieldName);

    if (Types.is.empty.array(value))
      return allowEmpty ? valid() : invalid(Msgs.mustBe.notEmpty());

    if (value.length < min) return invalid(Msgs.mustBe.atLeast(min.toString()));
    if (value.length > max) return invalid(Msgs.mustBe.atMost(max.toString()));

    if (itemValidator)
      return composite([
        ...value.map((item, index) => {
          return itemValidator(item, `${fieldName} at index ${index}`);
        })
      ]);
    else return valid();
  };
};
