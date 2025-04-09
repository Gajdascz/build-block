import { Obj } from '#utils';
import { Validator } from '#validator';

//#region> Types
type Input<RS, S, RQKeys extends keyof RS & string> = Omit<
  Pick<RS, RQKeys> & OptionalInput<RS, S, RQKeys>,
  keyof S
>;
type OptionalInput<RS, S, RQKeys extends keyof RS & string> = Omit<
  Partial<RS>,
  RQKeys | keyof S
>;

type CreateConfigTypes<RS, S, RQKeys extends keyof RS & string> = Readonly<{
  static: S;
  resolved: RS;
  requiredInput: Pick<RS, RQKeys>;
  optionalInput: OptionalInput<RS, S, RQKeys>;
  optionalDefaults: Required<OptionalInput<RS, S, RQKeys>>;
  /** Combined configuration with required properties and optional properties */
  input: Input<RS, S, RQKeys>;
  validators: {
    inputConfig: Validator.Types.Validator<Input<RS, S, RQKeys>>;
    resolvedConfig: Validator.Types.Validator<RS>;
    prop: Validator.Obj.ValidatorMap<RS>;
  };
  keys: {
    readonly requiredInput: RQKeys;
    readonly optionalInput: keyof OptionalInput<RS, S, RQKeys> & string;
    readonly input: keyof Input<RS, S, RQKeys> & string;
    readonly static: keyof S & string;
    readonly all: keyof RS & string;
  };
  keyArrays: {
    [K in keyof CreateConfigTypes<RS, S, RQKeys>['keys']
      & string]: CreateConfigTypes<RS, S, RQKeys>['keys'][K][];
  };
  resolveMethods: {
    input: (input: Input<RS, S, RQKeys>) => Validator.Types.Result<RS>;
    withValidation: {
      unknownInput: (input: unknown) => Validator.Types.Result<RS | null>;
      typedInput: (
        input: Input<RS, S, RQKeys>
      ) => Validator.Types.Result<RS | null>;
    };
  };
}>;

interface CreateConfigModuleOpts<RS, S, RQKeys extends keyof RS & string> {
  moduleName: string;
  _static: S;
  defaults: Required<OptionalInput<RS, S, RQKeys>>;

  validators: Validator.Obj.ValidatorMap<RS>;
  requiredPropKeys: readonly RQKeys[];
  inputResolveHelper?: (
    input: Input<RS, S, RQKeys>,
    defaults: Required<OptionalInput<RS, S, RQKeys>>,
    _static: S
  ) => Partial<Omit<RS, keyof S & string>>;
}

interface ConfigModule<RS, S, RQKeys extends keyof RS & string> {
  data: {
    readonly moduleName: string;
    static: S;
    defaults: CreateConfigTypes<RS, S, RQKeys>['optionalDefaults'];
    keys: CreateConfigTypes<RS, S, RQKeys>['keyArrays'];
  };
  ops: {
    resolve: CreateConfigTypes<RS, S, RQKeys>['resolveMethods'];
    validate: CreateConfigTypes<RS, S, RQKeys>['validators'];
  };
}
//#endregion.
export type {
  ConfigModule,
  CreateConfigModuleOpts,
  CreateConfigTypes,
  Input,
  OptionalInput
};
//#region>Utils
const extractKeyArrays = <RS, S, RQKeys extends keyof RS & string>(
  _static: S,
  defaults: Required<OptionalInput<RS, S, RQKeys>>,
  requiredPropKeys: readonly RQKeys[]
): CreateConfigTypes<RS, S, RQKeys>['keyArrays'] => {
  const optionalInput = Obj.keys(defaults);
  const staticKeys = Obj.keys(_static);
  const input = [
    ...requiredPropKeys,
    ...Obj.keys({ ...defaults })
  ] as (keyof Input<RS, S, RQKeys> & string)[];
  const requiredInput = [...requiredPropKeys];
  const all = [...requiredInput, ...optionalInput, ...staticKeys] as (keyof RS
    & string)[];
  return {
    optionalInput,
    requiredInput,
    input,
    static: staticKeys,
    all
  } as const;
};
const createValidators = <RS, S, RQKeys extends keyof RS & string>(
  validators: Validator.Obj.ValidatorMap<RS>,
  keys: CreateConfigTypes<RS, S, RQKeys>['keyArrays']
): CreateConfigTypes<RS, S, RQKeys>['validators'] => ({
  inputConfig: Validator.Obj.create({
    requiredPropKeys: [...keys.requiredInput],
    optionalPropKeys: [...keys.optionalInput],
    validators: Obj.clone(validators)
  }),
  resolvedConfig: Validator.Obj.create({
    requiredPropKeys: [...keys.all] as (keyof RS & string)[],
    validators: Obj.clone(validators)
  }),
  prop: Obj.clone(validators)
});
const createResolvers = <RS, S, RQKeys extends keyof RS & string>(
  _static: S,
  defaults: Required<OptionalInput<RS, S, RQKeys>>,
  configValidators: CreateConfigTypes<RS, S, RQKeys>['validators'],
  moduleName: string,
  inputResolveHelper?: CreateConfigModuleOpts<
    RS,
    S,
    RQKeys
  >['inputResolveHelper']
): CreateConfigTypes<RS, S, RQKeys>['resolveMethods'] => {
  const resolver =
    inputResolveHelper ?
      (input: Input<RS, S, RQKeys>): RS =>
        ({
          ...Obj.merge(defaults, input),
          ...inputResolveHelper(input, defaults, _static),
          ..._static
        }) as RS
    : (input: Input<RS, S, RQKeys>): RS =>
        ({ ...Obj.merge(defaults, input), ..._static }) as RS;

  return {
    input: (input) =>
      Validator.Result.valid(
        resolver(input),
        `[NOT_VALIDATED](${moduleName} input resolver)`
      ),
    withValidation: {
      unknownInput: (input: unknown) => {
        const { message, value } = configValidators.inputConfig(input);
        if (!value) return Validator.Result.invalid(value, message);
        const resolved = resolver(value);
        return configValidators.resolvedConfig(resolved);
      },
      typedInput: (input: Input<RS, S, RQKeys>) =>
        configValidators.resolvedConfig(resolver(input))
    }
  } as const;
};
//#endregion.

/** Creates a configuration module with standardized structure and typing */
export function createConfigModule<RS, S, RQKeys extends keyof RS & string>({
  moduleName,
  _static,
  defaults,
  validators,
  requiredPropKeys,
  inputResolveHelper
}: CreateConfigModuleOpts<RS, S, RQKeys>): ConfigModule<RS, S, RQKeys> {
  const keyArrays = extractKeyArrays<RS, S, RQKeys>(
    _static,
    defaults,
    requiredPropKeys
  );
  const validate = createValidators(validators, keyArrays);
  const resolve = createResolvers<RS, S, RQKeys>(
    _static,
    defaults,
    validate,
    moduleName,
    inputResolveHelper
  );
  return {
    data: { moduleName, static: _static, defaults, keys: keyArrays },
    ops: { resolve, validate: validate }
  } as const;
}
