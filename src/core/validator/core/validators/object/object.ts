import { Obj } from '#utils';
import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import type * as Types from '../../types/types.js';
import { composite } from '../composite/composite.js';

type ValidatorMap<T> = { [K in keyof T & string]: Types.Validator<T[K]> };

interface FactoryOpts<T> {
  requiredPropKeys?: (keyof T & string)[];
  optionalPropKeys?: (keyof T & string)[];
  validators: ValidatorMap<T>;
}
export type { FactoryOpts, ValidatorMap };

const createCompositeHandler =
  <T>({
    validators,
    optionalPropKeys = [],
    requiredPropKeys = []
  }: FactoryOpts<T>) =>
  (value: T & object, fieldName: string) =>
    requiredPropKeys.length > 0 || optionalPropKeys.length > 0 ?
      composite([
        ...requiredPropKeys.map((key) =>
          key in value ?
            validators[key](value[key], `${fieldName}.${key}`)
          : Result.invalid(value, fieldName, `${key} is required`)
        ),
        ...optionalPropKeys.map((key) =>
          key in value ?
            validators[key](value[key], `${fieldName}.${key}`)
          : Result.valid(value, fieldName)
        )
      ])
    : composite([
        ...(
          Object.entries(validators) as [
            keyof ValidatorMap<T>,
            ValidatorMap<T>[keyof ValidatorMap<T>]
          ][]
        ).map(([key, validator]) => {
          const typedKey = key;
          return typedKey in value ?
              validator(value[typedKey], `${fieldName}.${typedKey}`)
            : Result.valid(value, fieldName);
        })
      ]);

/**
 * If both `requiredPropKeys` and `optionalPropKeys` props are empty, it will validate all properties in the object using the full validators map
 */
export const create = <T>({
  requiredPropKeys = [],
  optionalPropKeys = [],
  validators
}: FactoryOpts<T>): Types.Validator<T> => {
  const compositeHandler = createCompositeHandler<T>({
    requiredPropKeys,
    optionalPropKeys,
    validators
  });
  return (value, fieldName = 'Object') => {
    if (!Obj.is<T & object>(value, requiredPropKeys))
      return Result.invalid(
        value,
        fieldName,
        Msgs.mustBe.anObject(
          fieldName,
          `with required properties ${requiredPropKeys.join(', ')}`
        )
      );
    else {
      const results = compositeHandler(value, fieldName);
      if (results.value === null)
        return Result.invalid(value, fieldName, results.message);
      else return Result.valid(value, fieldName);
    }
  };
};
