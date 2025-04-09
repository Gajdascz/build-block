import { describe, expect, it } from 'vitest';
import { path, utils } from '../../../../../__mocks__/index.js';
import type { ResultObj } from '../basic/basic.js';
import { findFile } from './find.js';
describe('findFile', () => {
  utils.beforeAfterEach();
  const expectInvalid = ({ result, error }: ResultObj<any>) => {
    expect(result).toBe(null);
    expect(error?.length).toBeGreaterThan(0);
  };
  it('should return the file path if it exists with extension', () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/file.js', 'content');
    path.extname.mockReturnValueOnce('');
    const { result } = findFile('/some/dir', {
      fileName: 'file',
      extension: 'js'
    });
    expect(result).toBe('/resolved/some/dir/file.js');
  });
  it('should return the file directly when path has extension and file exists', () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/file.js', 'content');
    path.extname.mockReturnValueOnce('.js');

    const { result } = findFile('/some/dir/file.js');
    expect(result).toBe('/resolved/some/dir/file.js');
  });
  it('should fail if file with extension does not exist', () => {
    path.extname.mockReturnValueOnce('.js');
    expectInvalid(findFile('/some/dir', { extension: 'js' }));
  });
  it('should handle case when filePath has trailing slash', () => {
    path.extname.mockReturnValueOnce('');
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/file.js', 'content');

    const { result } = findFile('/some/dir/', {
      fileName: 'file',
      extension: 'js'
    });
    expect(result).toBe('/resolved/some/dir/file.js');
  });
  it('should normalize extensions by removing leading dots', () => {
    utils.create.dir('/resolved/some/dir');
    utils.create.file('/resolved/some/dir/file.ts', 'content');
    const { result } = findFile('/some/dir', {
      fileName: 'file',
      extension: ['.ts']
    });
    expect(result).toBe('/resolved/some/dir/file.ts');
  });
  it('should fail if no extensions are provided', () => {
    path.extname.mockReturnValueOnce('');
    expectInvalid(findFile('/some/dir', { fileName: 'file', extension: [] }));
  });
  it('should fail if no file is found with any extension', () => {
    path.extname.mockReturnValueOnce('');
    expectInvalid(
      findFile('/some/dir', { fileName: 'file', extension: ['ts', 'js'] })
    );
  });
  describe('extensions', () => {
    it('should recognize file when path has extension that matches BASE_EXTENSIONS after normalization', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/script.js', 'content');
      path.extname.mockReturnValueOnce('.JS');
      const { result } = findFile('/some/dir/script.JS');
      expect(result).toBe('/resolved/some/dir/script.js');
    });
    it('should retain baseExtension when equal to normalized extension', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/script.js', 'content');
      path.extname.mockReturnValueOnce('.js');
      const { result } = findFile('/some/dir/script.js');
      expect(result).toBe('/resolved/some/dir/script.js');
    });

    it('should recognize file when path extension has a leading dot that needs to be removed', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/data.json', 'content');
      path.extname.mockReturnValueOnce('.json');
      const { result } = findFile('/some/dir/data.json', { extension: [] });
      expect(result).toBe('/resolved/some/dir/data.json');
    });

    it('should handle a path with non-standard extension that is included in provided extensions', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/config.yaml', 'content');
      path.extname.mockReturnValueOnce('.yaml');
      const { result } = findFile('/some/dir/config.yaml', {
        extension: 'yaml'
      });
      expect(result).toBe('/resolved/some/dir/config.yaml');
    });

    it('should handle when the path has an extension not in BASE_EXTENSIONS or provided extensions', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/custom.xyz', 'content');
      path.extname.mockReturnValueOnce('.xyz');
      expectInvalid(findFile('/some/dir/custom.xyz', { extension: 'json' }));
    });

    it('should handle extension capitalization differences correctly', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/module.js', 'content');
      path.extname.mockReturnValueOnce('.JS');
      const { result } = findFile('/some/dir/module.JS');
      expect(result).toBe('/resolved/some/dir/module.js');
    });
  });
  describe('multi-dot cases', () => {
    it('should find files with multiple dots in the filename', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/test.config.js', 'content');

      // Make sure extname returns only the last extension
      path.extname.mockReturnValueOnce('');

      const { result } = findFile('/some/dir/test.config', { extension: 'js' });
      expect(result).toBe('/resolved/some/dir/test.config.js');
    });

    it('should find files with dots in the base path', () => {
      utils.create.dir('/resolved/some/dir.test/nested');
      utils.create.file('/resolved/some/dir.test/nested/file.js', 'content');

      path.extname.mockReturnValueOnce('');

      const { result } = findFile('/some/dir.test/nested/file', {
        extension: 'js'
      });
      expect(result).toBe('/resolved/some/dir.test/nested/file.js');
    });

    it('should handle fileName with dots when searching', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/app.config.ts', 'content');

      path.extname.mockReturnValueOnce('');

      const { result } = findFile('/some/dir', {
        fileName: 'app.config',
        extension: 'ts'
      });
      expect(result).toBe('/resolved/some/dir/app.config.ts');
    });

    it('should correctly distinguish between file and extension when filename has multiple dots', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/version.1.2.json', 'content');

      path.extname.mockReturnValueOnce('.json');

      const { result } = findFile('/some/dir/version.1.2.json');
      expect(result).toBe('/resolved/some/dir/version.1.2.json');
    });

    it('should try all provided extensions when filename has multiple dots', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/build.config.ts', 'content');

      path.extname.mockReturnValueOnce('');

      const { result } = findFile('/some/dir/build.config', {
        extension: ['js', 'ts', 'json']
      });
      expect(result).toBe('/resolved/some/dir/build.config.ts');
    });

    it('should handle complete filepath with multiple dots and nested directories', () => {
      utils.create.dir('/resolved/some/project.name/src/config');
      utils.create.file(
        '/resolved/some/project.name/src/config/db.local.json',
        'content'
      );
      path.extname.mockReturnValueOnce('.json');

      const { result } = findFile(
        '/some/project.name/src/config/db.local.json'
      );
      expect(result).toBe(
        '/resolved/some/project.name/src/config/db.local.json'
      );
    });

    it('should prioritize the correct extension when a filename with dots exists with multiple extensions', () => {
      utils.create.dir('/resolved/some/dir');
      utils.create.file('/resolved/some/dir/config.local.js', 'js content');
      utils.create.file('/resolved/some/dir/config.local.ts', 'ts content');
      utils.create.file('/resolved/some/dir/config.local.json', 'json content');

      path.extname.mockReturnValueOnce('');

      const { result } = findFile('/some/dir/config.local', {
        extension: ['json', 'ts', 'js']
      });
      expect(result).toBe('/resolved/some/dir/config.local.json');
    });
  });
});
