import prompts from 'prompts';
import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import { type GroupManagerOpts, createGroupManager } from './groupManager.js';

vi.mock('prompts', () => {
  return { default: vi.fn() };
});
vi.spyOn(console, 'log').mockImplementation(() => {
  return;
});

describe('createGroupManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockOpts: GroupManagerOpts<'name' | 'email', 'name'> = {
    slug: 'test',
    prompts: {
      all: {
        name: { name: 'name', type: 'text', message: 'Enter name' },
        email: { name: 'email', type: 'text', message: 'Enter email' }
      },
      required: { name: { name: 'name', type: 'text', message: 'Enter name' } }
    },
    details: { desc: 'mocked opts', icon: 'mocked icon', title: 'mocked title' }
  };

  it('should create a group manager with default values', () => {
    const manager = createGroupManager({
      ...mockOpts,
      details: { desc: undefined, icon: undefined, title: undefined }
    });
    expect(manager.id).toBe('test-group');
    expect(manager.title).toBe('test Group');
    expect(manager.description).toBe('');
    expect(manager.icon).toBe('⚙️');
    expect(manager.objs).toEqual({
      all: mockOpts.prompts.all,
      required: mockOpts.prompts.required
    });
  });

  it('should create a group manager with custom details', () => {
    const manager = createGroupManager(mockOpts);
    expect(manager.title).toBe(mockOpts.details?.title);
    expect(manager.description).toBe(mockOpts.details?.desc);
    expect(manager.icon).toBe(mockOpts.details?.icon);
  });

  it('should transform prompt objects to arrays', () => {
    const manager = createGroupManager(mockOpts);
    expect(manager.fullArray).toHaveLength(2);
    expect(manager.fullArray[0]).toMatchObject(mockOpts.prompts.all.name);
    expect(manager.requiredArray).toHaveLength(1);
    expect(manager.requiredArray[0].name).toBe('name');
  });
  it('should return correct objects from objs getter', () => {
    const manager = createGroupManager(mockOpts);
    expect(manager.objs.all).toBe(mockOpts.prompts.all);

    expect(manager.objs.required).toBe(mockOpts.prompts.required);
    const mgr2 = createGroupManager({
      ...mockOpts,
      prompts: { all: mockOpts.prompts.all, required: undefined }
    });
    expect(mgr2.objs.required).toMatchObject({});
  });

  it('should handle empty required prompts in requiredArray getter', () => {
    const optsWithNoRequired: GroupManagerOpts<'name' | 'email', 'name'> = {
      ...mockOpts,
      prompts: { all: mockOpts.prompts.all, required: undefined }
    };
    const manager = createGroupManager(optsWithNoRequired);

    expect(manager.requiredArray).toEqual([]);
  });

  describe('execution methods', () => {
    const successResponse = { name: 'John', email: 'john@example.com' };
    const setupPromptMock = (responseValue: any) => {
      // main prompt
      (prompts as unknown as Mock).mockImplementationOnce((_, options) => {
        if (!responseValue) {
          if (options?.onCancel) options.onCancel({ name: 'test' });
          return null;
        }
        return responseValue;
      });
    };

    it('should execute all prompts successfully', async () => {
      setupPromptMock(successResponse);

      const manager = createGroupManager(mockOpts);
      const result = await manager.execAll();

      expect(prompts).toHaveBeenCalled();
      expect(result.result).toEqual(successResponse);
    });

    it('should execute required prompts successfully', async () => {
      setupPromptMock({ name: 'John' });

      const manager = createGroupManager(mockOpts);
      const result = await manager.execRequired();

      expect(prompts).toHaveBeenCalled();
      expect(result.result).toEqual({ name: 'John' });
    });

    it('should execute a subset of prompts successfully', async () => {
      setupPromptMock({ name: 'John' });

      const manager = createGroupManager(mockOpts);
      const result = await manager.execPrompts(['name']);

      expect(prompts).toHaveBeenCalled();
      expect(result.result).toEqual({ name: 'John' });
    });

    it('should handle cancellation', async () => {
      setupPromptMock(null);

      const manager = createGroupManager(mockOpts);
      const processExitSpy = vi
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never);

      await manager.execAll();

      expect(processExitSpy).toHaveBeenCalledWith(0);
      processExitSpy.mockRestore();
    });

    it('should handle errors during execution', async () => {
      (prompts as unknown as Mock).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const manager = createGroupManager(mockOpts);
      const result = await manager.execAll();

      expect(result.result).toBeNull();
    });
    describe('execPrompt method', () => {
      it('should execute a single prompt successfully', async () => {
        (prompts as unknown as Mock).mockImplementationOnce(() => {
          return { name: 'John' };
        });

        const manager = createGroupManager(mockOpts);
        const result = await manager.execPrompt('name');

        expect(prompts).toHaveBeenCalledTimes(1);
        expect(result.result).toEqual({ name: 'John' });
      });

      it('should handle cancellation during prompt execution', async () => {
        (prompts as unknown as Mock).mockImplementationOnce((_, options) => {
          if (options?.onCancel) options.onCancel({ name: 'name' });
          return null;
        });

        const manager = createGroupManager(mockOpts);
        const processExitSpy = vi
          .spyOn(process, 'exit')
          .mockImplementation(() => undefined as never);

        await manager.execPrompt('name');

        expect(processExitSpy).toHaveBeenCalledWith(0);
        expect(prompts).toHaveBeenCalledTimes(1);

        processExitSpy.mockRestore();
      });

      it('should handle errors during prompt execution', async () => {
        (prompts as unknown as Mock).mockImplementationOnce(() => {
          throw new Error('Failed to execute prompt');
        });

        const manager = createGroupManager(mockOpts);
        const result = await manager.execPrompt('name');

        expect(prompts).toHaveBeenCalledTimes(1);
        expect(result.result).toBeNull();
      });
    });
  });

  describe('log methods', () => {
    it('should have working log methods', () => {
      const manager = createGroupManager(mockOpts);
      manager.log.header();
      manager.log.success('Test', 'Success');
      manager.log.cancelled('Test', 'Cancelled');
      manager.log.error('Test', 'Error');
      manager.log.info('Test', 'Info');
      manager.log.warn('Test', 'Warning');

      expect(console.log).toHaveBeenCalled();
    });
  });
});
