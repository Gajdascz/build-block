import { Volume, createFsFromVolume } from 'memfs';
import { afterEach, beforeEach, vi } from 'vitest';

const vol = Volume.fromJSON({});
const memfs = createFsFromVolume(vol);
const mockFs = {
  ...memfs,
  promises: memfs.promises,
  default: memfs,
  __esModule: true
} as const;

const mockPrompts = { default: vi.fn(), __esModule: true } as const;
const prompts = mockPrompts.default;
// Create the mock object
const mockPath = {
  default: {
    isAbsolute: vi.fn((p: string) => p.startsWith('/')),
    resolve: vi.fn((...p: string[]) => {
      // Last argument is the most important
      const lastArg = p[p.length - 1];
      return `/resolved${lastArg.startsWith('/') ? '' : '/'}${lastArg.endsWith('/') ? lastArg.slice(0, -1) : lastArg}`;
    }),
    join: vi.fn((...parts) => parts.join('/')),
    dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/')),
    extname: vi.fn((p: string) => {
      const parts = p.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    }),
    basename: vi.fn((p: string) => {
      const parts = p.split('/');
      return parts[parts.length - 1];
    }),
    __esModule: true
  }
};
const path = mockPath.default;

vi.mock('fs', () => mockFs);
vi.mock('path', () => mockPath);
vi.mock('prompts', () => mockPrompts);
vi.mock('node:module', () => {
  return { createRequire: vi.fn() };
});

const reset = {
  fs: (fileStructure = {}) => {
    vol.reset();
    vol.fromJSON(fileStructure);
  },
  all: (fileStructure = {}) => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    reset.fs(fileStructure);
  }
};
const mockImport = (modulePath = '', moduleExports: unknown) => {
  vi.doUnmock(modulePath);
  vi.doMock(modulePath, async () => await Promise.resolve(moduleExports));
};
const setup = {
  prompts: (response = {}) => {
    mockPrompts.default.mockResolvedValue(response);
  },
  test: (files = {}, promptsResponse = {}) => {
    reset.all(files);
    setup.prompts(promptsResponse);
  }
} as const;

const create = {
  dir: (dirPath: string) => vol.mkdirSync(dirPath, { recursive: true }),
  file: (filePath: string, content: string) => {
    const dir = path.dirname(filePath);
    create.dir(dir);
    vol.writeFileSync(filePath, content);
  }
} as const;
const read = {
  sync: {
    file: (filePath: string) => vol.readFileSync(filePath, 'utf-8'),
    dir: (dirPath: string) => vol.readdirSync(dirPath)
  },
  async: {
    file: (filePath: string) => vol.promises.readFile(filePath, 'utf-8'),
    dir: (dirPath: string) => vol.promises.readdir(dirPath)
  }
};
const does = {
  fileExists: (filePath: string) => vol.existsSync(filePath)
} as const;
const beforeAfterEach = () => {
  beforeEach(() => {
    reset.all();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
};
const utils = {
  create,
  does,
  read,
  reset,
  setup,
  beforeAfterEach,
  mockImport
} as const;

export { mockFs as fs, path, prompts, utils };
export default {
  fs: mockFs,
  path: mockPath,
  prompts: mockPrompts,
  utils
} as const;
