import * as distignore from './distignore.js';
import * as editorCss from './editorCss.js';
import * as entryPhp from './entryPhp.js';
import * as eslint from './eslint.js';
import * as gitignore from './gitignore.js';
import * as license from './license.js';
import * as npmrc from './npmrc.js';
import * as prettierignore from './prettierignore.js';
import * as readmeTxt from './readmeTxt.js';
import * as css from './styleCss.js';
import * as uninstall from './uninstallPhp.js';
import * as vitest from './vitest.js';
export const load = (pluginSlug: string) =>
  [
    distignore.create(),
    editorCss.create(),
    entryPhp.create(pluginSlug),
    eslint.create(),
    gitignore.create(),
    npmrc.create(),
    prettierignore.create(),
    readmeTxt.create(),
    css.create(),
    vitest.create(),
    license.create(),
    uninstall.create()
  ] as const;
