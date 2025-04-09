import * as tsConfigBase from './base.js';
import * as tsConfigDev from './dev.js';
import * as tsConfigSrc from './src.js';
import * as tsConfigTest from './test.js';

const load = () =>
  [
    tsConfigBase.create(),
    tsConfigDev.create(),
    tsConfigSrc.create(),
    tsConfigTest.create()
  ] as const;

export { load };
