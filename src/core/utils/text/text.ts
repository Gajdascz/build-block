/** Matches variations of word separators */
const separatorRegex = /[\s,/+&\\?=_.<>{}:;'"*&$#~!@|\][`()^%-]+/g;

/** Coerces input to proper slug format */
const slugify = (str: string) =>
  typeof str === 'string' ?
    str
      .trim()
      .replace(/^\d+/, (match) => `n${match}`)
      .replace(separatorRegex, '-')
      .replace(/-+$/g, '')
      .toLowerCase()
  : '';

/**
 * Convert kebab case string to pascal case
 * kebab: an-example-string
 * pascal: anExampleString
 */
const kebabToPascal = (str: string) =>
  cleanStringArray(slugify(str).split(/-/g)).reduce((acc, curr) => {
    acc += curr[0]!.toUpperCase() + curr.slice(1);
    return acc;
  }, '');

const join = {
  pre: (body = '', prefix = '', space = 1) =>
    `${prefix}${' '.repeat(space)}${body}`.trim(),
  post: (body = '', postfix = '', space = 1) =>
    `${body}${' '.repeat(space)}${postfix}`.trim(),
  affix: (body = '', pre = '', post = '', space = 1) => {
    const prefixed = pre ? join.pre(body, pre, space) : body;
    return post ? join.post(prefixed, post, space) : prefixed;
  }
} as const;
const capitalize = <S extends string>(str: S): Capitalize<S> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;

const cleanStringArray = (arr: unknown[]) =>
  arr
    .map((str) =>
      (typeof str === 'string' && str.trim().length > 0 ? str : '').trim()
    )
    .filter((str) => str.length > 0);

export {
  capitalize,
  cleanStringArray,
  join,
  kebabToPascal,
  separatorRegex,
  slugify
};
