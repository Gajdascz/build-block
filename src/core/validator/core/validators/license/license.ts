import { Obj } from '#utils';
import * as Msgs from '../../messages/index.js';
import * as Result from '../../result/result.js';
import { type License, type Validator, is } from '../../types/types.js';

export const license: Validator<License> = (value, fieldName = 'License') => {
  const invalid = (message: string) =>
    Result.invalid(value, fieldName, message);
  if (!Obj.is<License>(value, ['type', 'url']))
    return invalid(
      Msgs.mustBe.anObject('License', 'With required properties type and url')
    );
  if (typeof value.type !== 'string')
    return invalid(`type ${Msgs.mustBe.aString()}`);
  if (is.empty.string(value.type))
    return invalid(`type ${Msgs.mustBe.notEmpty()}`);
  if (!is.url(value.url)) return invalid(`url ${Msgs.mustBe.aUrl()}`);
  return Result.valid(value, fieldName);
};
