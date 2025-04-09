// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck -> Node system modules are not typed.
import { describe, expect, it, vi } from 'vitest';
import { path, prompts, utils } from '../../../../../__mocks__/index.js';
import { type WriteTemplate, write } from './write.js';

describe('write', () => {
  utils.beforeAfterEach();
  const mockConfig = { outputDirectory: '/output/dir', someOtherProp: 'value' };

  const mockTemplates: WriteTemplate<typeof mockConfig>[] = [
    {
      filename: 'file1.js',
      relativePath: 'src',
      generate: vi.fn(() => 'file1 content')
    },
    {
      filename: 'file2.js',
      relativePath: '',
      generate: vi.fn(() => 'file2 content')
    },
    { filename: 'file3.js', generate: vi.fn(() => 'file3 content') }
  ];

  it('should write files to the output directory from config', async () => {
    const { result } = await write(mockConfig, mockTemplates);
    expect(result).toBe(true);
    expect(utils.does.fileExists('/output/dir/src')).toBe(true);
    expect(utils.does.fileExists('/output/dir/src/file1.js')).toBe(true);
    expect(utils.does.fileExists('/output/dir/file2.js')).toBe(true);
    expect(utils.does.fileExists('/output/dir/file3.js')).toBe(true);

    expect(await utils.read.async.file('/output/dir/src/file1.js')).toBe(
      'file1 content'
    );
    expect(mockTemplates[0].generate).toHaveBeenCalledWith(mockConfig);
  });

  it('should use default output directory if not specified in config', async () => {
    const configWithoutOutputDir = { someOtherProp: 'value' };

    await write(configWithoutOutputDir, mockTemplates);
    expect(path.join).toHaveBeenCalledWith(process.cwd(), 'output');
  });

  it('should prompt for confirmation if directory is not empty', async () => {
    utils.create.dir('/output/dir/src');
    utils.create.file('/output/dir/src/existing-file', 'content');
    const { result } = await write(mockConfig, mockTemplates, {
      overwrite: {
        behavior: 'prompt',
        promptFn: prompts.mockImplementationOnce(
          async () => await Promise.resolve({ result: true })
        )
      }
    });
    expect(prompts).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should cancel if user does not confirm overwrite', async () => {
    utils.create.dir('/output/dir/src');
    utils.create.file('/output/dir/src/existing-file', 'content');
    prompts.mockResolvedValueOnce({ result: false });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      return;
    });

    const { result } = await write(mockConfig, mockTemplates);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
  it('should force write when behavior is force and directory is not empty', async () => {
    utils.create.dir('/output/dir/src');
    utils.create.file('/output/dir/src/existing-file', 'existing content');

    const { result } = await write(mockConfig, mockTemplates, {
      overwrite: { behavior: 'force' }
    });

    expect(result).toBe(true);
    expect(utils.does.fileExists('/output/dir/src/file1.js')).toBe(true);
    expect(await utils.read.async.file('/output/dir/src/file1.js')).toBe(
      'file1 content'
    );
  });

  it('should fail when behavior is prompt but no promptFn is provided', async () => {
    utils.create.dir('/output/dir/src');
    utils.create.file('/output/dir/src/existing-file', 'existing content');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      return;
    });

    const { result } = await write(mockConfig, mockTemplates, {
      overwrite: { behavior: 'prompt' }
    });

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled(
      expect.stringContaining('No prompt function provided')
    );
    consoleSpy.mockRestore();
  });

  it('should cancel write when user declines in prompt function', async () => {
    utils.create.dir('/output/dir/src');
    utils.create.file('/output/dir/src/existing-file', 'existing content');

    const customPromptFn = vi.fn().mockResolvedValue({ result: false });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      return;
    });

    const { result } = await write(mockConfig, mockTemplates, {
      overwrite: { behavior: 'prompt', promptFn: customPromptFn }
    });

    expect(result).toBeNull();
    expect(customPromptFn).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Operation cancelled by user.');
    expect(utils.does.fileExists('/output/dir/src/file1.js')).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should skip write when directory is not empty with default behavior', async () => {
    utils.create.dir('/output/dir/src');
    utils.create.file('/output/dir/src/existing-file', 'existing content');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      return;
    });

    const { result } = await write(mockConfig, mockTemplates);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Directory /output/dir is not empty')
    );
    expect(utils.does.fileExists('/output/dir/src/file1.js')).toBe(false);

    consoleSpy.mockRestore();
  });
});
