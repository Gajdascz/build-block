import type { ConfiguredTemplate } from '#config';
import { JSON_SCHEMAS } from '#constants';
const create = (): ConfiguredTemplate => ({
  filename: 'tsconfig.base.json',
  generate: () =>
    JSON.stringify({
      $schema: JSON_SCHEMAS.tsconfig,
      compilerOptions: {
        target: 'ESNext',
        useDefineForClassFields: true,
        incremental: true,
        noErrorTruncation: true,
        pretty: true,
        preserveWatchOutput: true,
        allowJs: true,
        composite: true,
        jsx: 'react-jsx',
        lib: ['DOM', 'DOM.Iterable', 'ESNext'],
        types: [
          '@wordpress/blocks',
          '@types/wordpress__block-editor',
          '@wordpress/components',
          '@wordpress/interactivity',
          '@wordpress/i18n',
          '@wordpress/element',
          '@types/react',
          '@types/react-dom',
          '@types/node'
        ],
        module: 'ESNext',
        moduleResolution: 'node',
        esModuleInterop: true,
        moduleDetection: 'auto',
        verbatimModuleSyntax: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        allowImportingTsExtensions: false,
        isolatedModules: true,
        outDir: './build',
        tsBuildInfoFile: '.cache/.tsbuildinfo',
        removeComments: true,
        sourceMap: true,
        declaration: true,
        declarationMap: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        alwaysStrict: true,
        noImplicitAny: true,
        noImplicitThis: true,
        strictBindCallApply: true,
        strictFunctionTypes: true,
        strictNullChecks: true,
        strictPropertyInitialization: true,
        useUnknownInCatchVariables: true,
        noUnusedParameters: false,
        noUnusedLocals: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        skipLibCheck: true
      }
    })
});

export { create };
