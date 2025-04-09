type NestedPartial<T> =
  T extends object ? { [P in keyof T]?: NestedPartial<T[P]> } : T;

type FullPartialUnion<T> = { [P in keyof T]?: T[P] | NestedPartial<T[P]> };
type NestedWritable<T> =
  T extends object ? { -readonly [P in keyof T]: T[P] } : T;

type NestedRequired<T> = NonNullable<
  T extends object ? { [P in keyof T]-?: NestedRequired<T[P]> } : T
>;

type StringRecord = Record<string, unknown>;
type StrProperty<T> = keyof T & string;

type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>>;
type PartialOmit<T, K extends keyof T> = Partial<Omit<T, K>>;

/**
 * Extracts optional properties from a type
 * @example
 * ```
 * type User = { id: number, name?: string }
 * type Optional = ExtractOptional<User> // { name?: string }
 * ```
 */
type ExtractOptional<T> = {
  [K in string & keyof T as undefined extends T[K] ? K : never]: T[K];
};
type ExtractRequired<T> = {
  [K in string & keyof T as undefined extends T[K] ? never : K]: T[K];
};
type OptionalKey<T> = keyof ExtractOptional<T>;
type RequiredKey<T> = keyof ExtractRequired<T>;
type OptionalToRequired<T> = NestedRequired<ExtractOptional<T>>;
type Key<T> = OptionalKey<T> | RequiredKey<T>;

const is = <V = StringRecord, K = keyof V & string>(
  provided: unknown,
  strKeys: (K & string)[] = []
): provided is V =>
  typeof provided === 'object'
  && provided !== null
  && strKeys.every((key) => key in provided);
const isPartialOf = <V = object>(
  partial: unknown,
  established: V
): partial is FullPartialUnion<V> =>
  is(partial)
  && is(established)
  && Object.entries(partial).every(([key, value]) => {
    const val = established[key];
    if (!val) return false;
    return is(val) ? isPartialOf(value, val) : typeof value === typeof val;
  });
const isStrKeyOf = <T extends StringRecord = StringRecord>(
  key: unknown,
  obj: T
): key is StrProperty<T> => typeof key === 'string' && key in obj;

const clone = <T>(obj: T): T => {
  if (!is(obj)) return obj;
  if (Array.isArray(obj))
    return obj.map((item: unknown) => (is(item) ? clone(item) : item)) as T;
  const result: StringRecord = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = is(value) ? clone(value) : value;
  }
  return result as T;
};

interface FreezeOpts {
  clone: boolean;
  maxDepth: number;
}
const freeze = <T>(obj: T, opts: Partial<FreezeOpts> = {}): Readonly<T> => {
  if (Object.isFrozen(obj)) return obj;
  const target = opts.clone ? clone(obj) : obj;
  const _freeze = (object: unknown, depth: number): Readonly<T> => {
    if (depth === 0 || !is(object) || Object.isFrozen(object))
      return object as Readonly<T>;

    return Object.freeze(
      Object.fromEntries(
        Object.entries(object).map(([key, value]) => [
          key,
          is(value) ? _freeze(value, depth - 1) : value
        ])
      )
    ) as Readonly<T>;
  };
  return _freeze(target, opts.maxDepth ?? 1);
};
type MergeFn<R> = (current: R, next: unknown) => R;

const merge = <R>(current: R, next: unknown): R => {
  if (!is(next)) return current;
  const result = clone<R>(current) as StringRecord;
  return Object.entries(next).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = clone(value);
      return acc;
    }
    if (is(value) && key in result)
      acc[key] = merge(result[key] as object, value);
    else acc[key] = value;
    return acc;
  }, result) as R;
};
const isEmpty = (obj: unknown) => is(obj) && Object.keys(obj).length === 0;

const keys = <T>(obj: T) =>
  is(obj) ? (Object.keys(obj) as (keyof T & string)[]) : [];

export {
  type ExtractOptional,
  type ExtractRequired,
  type FreezeOpts,
  type FullPartialUnion,
  type Key,
  type MergeFn,
  type NestedPartial,
  type NestedRequired,
  type NestedWritable,
  type OptionalKey,
  type OptionalToRequired,
  type PartialOmit,
  type PartialPick,
  type RequiredKey,
  type StringRecord,
  type StrProperty,
  clone,
  freeze,
  is,
  isEmpty,
  isPartialOf,
  isStrKeyOf,
  keys,
  merge
};
