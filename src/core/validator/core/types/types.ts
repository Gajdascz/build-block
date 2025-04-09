import { Obj } from '#utils';

const REGEX = {
  /** https://uibakery.io/regex-library/url */
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  /**
   * https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
   */
  semVer:
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
} as const;
type Url = `${'http' | 'https'}://${string}.${string}`;
const isUrl = (value: unknown): value is Url =>
  typeof value === 'string' && REGEX.url.test(value);
type Version = `${number}.${number}.${number}`;
const isVersion = (value: unknown): value is Version =>
  typeof value === 'string' && REGEX.semVer.test(value);

const PRIMITIVE = {
  string: 'string',
  number: 'number',
  bigint: 'bigint',
  boolean: 'boolean',
  symbol: 'symbol',
  function: 'function'
} as const;
type Primitive = keyof typeof PRIMITIVE;
const isPrimitiveType = (value: unknown): value is Primitive =>
  typeof value === 'string' && value in PRIMITIVE;

interface Bounds {
  min: number;
  max: number;
}
const isBounds = (value: unknown): value is Bounds =>
  Obj.is(value)
  && typeof value.min === 'number'
  && typeof value.max === 'number';

interface Result<T> {
  value: T | null;
  message: string;
}
const isResult = <T>(value: unknown): value is Result<T> =>
  Obj.is(value)
  && typeof value.message === 'string'
  && typeof value !== 'undefined';

type Validator<T, O = Obj.StringRecord> = (
  value: unknown,
  fieldName?: string,
  opts?: Obj.NestedPartial<O>,
  ...args: any[]
) => Result<T | null>;

const isPrimitive = {
  type: isPrimitiveType,
  string: <V = string>(v: unknown): v is V => typeof v === 'string',
  number: <V = number>(v: unknown): v is V => typeof v === 'number',
  bigint: <V = bigint>(v: unknown): v is V => typeof v === 'bigint',
  boolean: <V = boolean>(v: unknown): v is V => typeof v === 'boolean',
  symbol: <V = symbol>(v: unknown): v is V => typeof v === 'symbol',
  function: <V = (...args: any[]) => unknown>(v: unknown): v is V =>
    typeof v === 'function'
} as const;
const isEmpty = {
  string: (v: unknown): v is '' => v === '',
  array: <V = unknown>(v: unknown): v is V[] =>
    Array.isArray(v) && v.length === 0
} as const;
interface Person {
  name: string;
  url: string;
  email: string;
}
interface PartialPerson extends Partial<Person> {
  name: string;
}
const isPartialPerson = (
  value: unknown,
  allowEmpty = false
): value is PartialPerson =>
  Obj.is<PartialPerson>(value, ['email', 'name', 'url'])
  && typeof value.name === 'string'
  && (allowEmpty ? true : !is.empty.string(value.name));

const isPerson = (value: unknown, validateUrl = false): value is Person =>
  Obj.is<Person>(value, ['email', 'name', 'url'])
  && typeof value.url === 'string'
  && (!validateUrl || is.url(value.url))
  && typeof value.email === 'string'
  && typeof value.name === 'string';
const EMPTY_PERSON: Person = { name: '', url: '', email: '' } as const;

interface License {
  type: string;
  url: string;
}
const isLicense = (value: unknown): value is License =>
  Obj.is(value) && typeof value.type === 'string' && is.url(value.url);

const is = {
  primitive: isPrimitive,
  url: isUrl,
  version: isVersion,
  bounds: isBounds,
  result: isResult,
  person: isPerson,
  partialPerson: isPartialPerson,
  primitiveType: isPrimitiveType,
  license: isLicense,
  empty: isEmpty
} as const;

export {
  type Bounds,
  type License,
  type PartialPerson,
  type Person,
  type Result,
  type Url,
  type Validator,
  type Version,
  EMPTY_PERSON,
  is,
  PRIMITIVE,
  REGEX
};
