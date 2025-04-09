import { Obj } from '#utils';
import * as Msgs from '../../messages/messages.js';
import * as Result from '../../result/result.js';
import {
  type PartialPerson,
  type Person,
  type Validator,
  is
} from '../../types/types.js';

interface PersonValidatorOpts {
  allowEmpty?: {
    all?: boolean;
    name?: boolean;
    url?: boolean;
    email?: boolean;
  };
}

const isPersonKey = (key: unknown): key is 'name' | 'url' | 'email' =>
  typeof key === 'string'
  && (key === 'name' || key === 'url' || key === 'email');

export const full: Validator<Person, PersonValidatorOpts> = (
  value,
  fieldName = 'Person',
  { allowEmpty = {} }: PersonValidatorOpts = {}
) => {
  const allowedEmpty = {
    all: false,
    name: false,
    url: false,
    email: false,
    ...allowEmpty
  };
  const invalid = (message: string) =>
    Result.invalid(value, fieldName, message);

  if (
    !Obj.is<Person>(value)
    || Array.isArray(value)
    || !Object.keys(value).every(isPersonKey)
  )
    return invalid(Msgs.mustBe.anObject('Person'));

  const allStrings = Object.values(value).every((v) => typeof v === 'string');
  if (!allStrings) return invalid(Msgs.mustBe.anObject());
  if (allowedEmpty.all) return Result.valid<Person>(value, fieldName);
  if (!allowedEmpty.name && is.empty.string(value.name))
    return invalid(Msgs.mustBe.notEmpty());
  if (!allowedEmpty.url && is.empty.string(value.url))
    return invalid(Msgs.mustBe.notEmpty());
  if (!allowedEmpty.email && is.empty.string(value.email))
    return invalid(Msgs.mustBe.notEmpty());

  return Result.valid<Person>(value, fieldName);
};

export const partial: Validator<
  PartialPerson,
  { allowEmpty: { name?: boolean } }
> = (value, fieldName = 'PartialPerson', { allowEmpty = {} } = {}) =>
  is.partialPerson(value, allowEmpty.name) ?
    Result.valid<PartialPerson>(value, fieldName)
  : Result.invalid(
      value,
      fieldName,
      Msgs.mustBe.anObject('PartialPerson', 'With a non-empty name property.')
    );
