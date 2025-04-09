import * as babel from './babel.js';
import * as composer from './composer.js';
import * as pkg from './package.js';
import * as prettier from './prettier.js';
import * as stylelint from './stylelint.js';
import * as tsconfig from './tsconfigs/index.js';
import * as tsdoc from './tsdoc.js';
import * as vscode from './vscode/index.js';

export const load = () =>
  [
    ...tsconfig.load(),
    ...vscode.load(),
    pkg.create(),
    babel.create(),
    composer.create(),
    prettier.create(),
    stylelint.create(),
    tsdoc.create()
  ] as const;
