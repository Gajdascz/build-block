import { join } from '#utils';
type MsgFn = (prefix?: string, postfix?: string) => string;
export const mustBe: Record<
  | '_'
  | 'a'
  | 'an'
  | 'not'
  | 'notA'
  | 'notAn'
  | 'aSemver'
  | 'aNumber'
  | 'aString'
  | 'aUrl'
  | 'aFunction'
  | 'aBoolean'
  | 'aBigInt'
  | 'aSymbol'
  | 'aFiniteNum'
  | 'aPositiveNum'
  | 'aNegativeNum'
  | 'anArray'
  | 'anObject'
  | 'anEmail'
  | 'empty'
  | 'notEmpty'
  | 'notNaN'
  | 'atLeast'
  | 'atMost'
  | 'true'
  | 'false',
  MsgFn
> = {
  _: (pr = '', po = '') => join.affix(`must be`, pr, po),
  a: (pr = '', po = '') => mustBe._(pr, `a ${po}`),
  an: (pr = '', po = '') => mustBe._(pr, `an ${po}`),
  aSemver: (pr = '', po = '') =>
    mustBe.a(
      `${pr} valid (semver version)[https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string]`,
      po
    ),
  not: (pr = '', po = '') => join.affix('must not be', pr, po),
  notA: (pr = '', po = '') => mustBe.not(pr, `a ${po}`),
  notAn: (pr = '', po = '') => mustBe.not(pr, `an ${po}`),
  aNumber: (pr = '', po = '') => mustBe.a(pr, `number ${po}`),
  aString: (pr = '', po = '') => mustBe.a(pr, `string ${po}`),
  aUrl: (pr = '', po = '') => mustBe.a(pr, `url ${po}`),
  aFunction: (pr = '', po = '') => mustBe.a(pr, `function ${po}`),
  aBoolean: (pr = '', po = '') => mustBe.a(pr, `boolean ${po}`),
  aBigInt: (pr = '', po = '') => mustBe.a(pr, `bigint ${po}`),
  aSymbol: (pr = '', po = '') => mustBe.a(pr, `symbol ${po}`),
  aFiniteNum: (pr = '', po = '') => mustBe.a(pr, `finite number ${po}`),
  aPositiveNum: (pr = '', po = '') => mustBe.a(pr, `positive number ${po}`),
  aNegativeNum: (pr = '', po = '') => mustBe.a(pr, `negative number ${po}`),
  anArray: (pr = '', po = '') => mustBe.an(pr, `array ${po}`),
  anObject: (pr = '', po = '') => mustBe.an(pr, `object ${po}`),
  anEmail: (pr = '', po = '') => mustBe.an(pr, `email address ${po}`),
  empty: (pr = '', po = '') => mustBe._(pr, `empty ${po}`),
  notEmpty: (pr = '', po = '') => mustBe.not(pr, `empty ${po}`),
  notNaN: (pr = '', po = '') => mustBe.not(pr, `NaN ${po}`),
  atLeast: (pr = '', po = '') => mustBe._(pr, `at least ${po}`),
  atMost: (pr = '', po = '') => mustBe._(pr, `at most ${po}`),
  true: (pr = '', po = '') => mustBe._(pr, `true ${po}`),
  false: (pr = '', po = '') => mustBe._(pr, `false ${po}`)
} as const;

export const mustHave: Record<
  '_' | 'a' | 'an' | 'prop' | 'props' | 'keys',
  MsgFn
> = {
  _: (pr = '', po = '') => join.affix(`must have`, pr, po),
  a: (pr = '', po = '') => mustHave._(pr, `a ${po}`),
  an: (pr = '', po = '') => mustHave._(pr, `an ${po}`),
  prop: (pr = '', po = '') => mustHave._(pr, `property ${po}`),
  props: (pr = '', po = '') => mustHave._(pr, `properties ${po}`),
  keys: (pr = '', po = '') => mustHave._(pr, `keys ${po}`)
} as const;
