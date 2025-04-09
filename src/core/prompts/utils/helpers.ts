import { type ModuleTypes, modules } from '#config';
import { cleanStringArray } from '#utils';
import type prompts from 'prompts';

const formatAnswers = (answers = {}) =>
  Object.entries(answers)
    .map(([key, value]) => {
      const formattedValue =
        Array.isArray(value) ? value.join(', ')
        : typeof value === 'object' ? JSON.stringify(value, null, 2)
        : value;
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return `  ${key}: ${String(formattedValue)}`;
    })
    .join('\n');
const splitStrArr = (v: unknown) =>
  typeof v === 'string' ? cleanStringArray(v.split(',')) : [];
const parseJson = <V>(v: unknown, fallback: V) =>
  typeof v === 'string' ? (JSON.parse(v) as V) : fallback;
const createStringArrayPrompt = <
  V extends string,
  M extends keyof ModuleTypes & string,
  P extends keyof ModuleTypes[M]['validators']['prop'] & string
>(
  name: V,
  initial: string,
  message: string,
  validatorCfg: { module: M; prop: P } | ((v: unknown) => boolean) = (
    v: unknown
  ) => typeof v === 'string'
): prompts.PromptObject<V> => ({
  name,
  type: 'text',
  initial,
  message,
  validate:
    typeof validatorCfg === 'function' ? validatorCfg : (
      createValidator(validatorCfg.module, validatorCfg.prop)
    ),
  format: splitStrArr
});

const createValidator =
  <
    M extends keyof ModuleTypes & string,
    P extends keyof ModuleTypes[M]['validators']['prop'] & string
  >(
    module: M,
    prop: P
  ) =>
  (v: unknown) => {
    const propValidators = modules[module].ops.validate.prop;
    if (!(prop in propValidators))
      return `${String(prop)} not a property validator of the ${module} module.`;
    const { message, value } =
      propValidators[prop as keyof typeof propValidators](v);
    return value === null ? message : true;
  };
interface CreatePromptOpts<
  T extends prompts.PromptType,
  M extends keyof ModuleTypes & string,
  P extends keyof ModuleTypes[M]['validators']['prop'] & string
> {
  moduleName: M;
  promptName: P;
  type: T;
  message: string;
  validatorOverride?: prompts.PromptObject['validate'];
  initialDefaultOverride?: prompts.InitialReturnValue;
  format?: prompts.PromptObject['format'];
  choices?: prompts.PromptObject['choices'];
  required?: boolean;
}
const createPrompt = <
  T extends prompts.PromptType,
  M extends keyof ModuleTypes & string,
  P extends keyof ModuleTypes[M]['validators']['prop'] & string
>({
  moduleName,
  promptName,
  type,
  required = false,
  message,
  validatorOverride,
  initialDefaultOverride,
  format,
  choices
}: CreatePromptOpts<T, M, P>): Pick<
  prompts.PromptObject<P>,
  'name' | 'type' | 'message' | 'validate' | 'initial' | 'format' | 'choices'
> => ({
  name: promptName,
  type,
  message: `${message} ${required ? '(required)' : '(optional)'}`,
  validate: validatorOverride ?? createValidator(moduleName, promptName),
  initial:
    initialDefaultOverride
    ?? (
      modules[moduleName].data.defaults as Record<P, prompts.InitialReturnValue>
    )[promptName],
  format,
  choices
});

export {
  createPrompt,
  createStringArrayPrompt,
  createValidator,
  formatAnswers,
  parseJson,
  splitStrArr
};
