import { describe, expect, it } from 'vitest';
import { isConstant, LICENSE, SUPPORTED_EXTS, VERSIONS } from './constants';

describe('Constants Module', () => {
  describe('SUPPORTED_EXTS', () => {
    describe('is', () => {
      it('should identify valid supported extensions', () => {
        // Valid extensions
        expect(SUPPORTED_EXTS.is('json')).toBe(true);
        expect(SUPPORTED_EXTS.is('ts')).toBe(true);
        expect(SUPPORTED_EXTS.is('js')).toBe(true);
      });

      it('should reject invalid extensions', () => {
        // Invalid extensions
        expect(SUPPORTED_EXTS.is('jsx')).toBe(false);
        expect(SUPPORTED_EXTS.is('tsx')).toBe(false);
        expect(SUPPORTED_EXTS.is('')).toBe(false);
        expect(SUPPORTED_EXTS.is(null)).toBe(false);
        expect(SUPPORTED_EXTS.is(undefined)).toBe(false);
        expect(SUPPORTED_EXTS.is(42)).toBe(false);
        expect(SUPPORTED_EXTS.is({})).toBe(false);
      });
    });

    describe('has', () => {
      it('should detect strings with supported extensions', () => {
        expect(SUPPORTED_EXTS.has('file.json')).toBe(true);
        expect(SUPPORTED_EXTS.has('some.config.ts')).toBe(true);
        expect(SUPPORTED_EXTS.has('script.js')).toBe(true);
        expect(SUPPORTED_EXTS.has('path/to/file.ts')).toBe(true);
      });

      it('should reject strings without supported extensions', () => {
        expect(SUPPORTED_EXTS.has('file.jsx')).toBe(false);
        expect(SUPPORTED_EXTS.has('file')).toBe(false);
        expect(SUPPORTED_EXTS.has('file.')).toBe(false);
        expect(SUPPORTED_EXTS.has('')).toBe(false);
        expect(SUPPORTED_EXTS.has(null)).toBe(false);
        expect(SUPPORTED_EXTS.has(undefined)).toBe(false);
        expect(SUPPORTED_EXTS.has(42)).toBe(false);
        expect(SUPPORTED_EXTS.has({})).toBe(false);
        expect(
          SUPPORTED_EXTS.has(() => {
            return;
          })
        ).toBe(false);

        // Standalone extensions ARE extensions (is-a) not (has-a)
        expect(SUPPORTED_EXTS.has('.js')).toBe(false);
        expect(SUPPORTED_EXTS.has('.ts')).toBe(false);
        expect(SUPPORTED_EXTS.has('.json')).toBe(false);
      });
    });

    describe('toString', () => {
      it('should return a comma-separated list of supported extensions', () => {
        const result = SUPPORTED_EXTS.toString();
        expect(result).toContain('json');
        expect(result).toContain('ts');
        expect(result).toContain('js');
        expect(result.split(', ').length).toBe(3);
      });
    });
  });

  describe('isConstant', () => {
    describe('configInputProvider', () => {
      it('should validate valid input provider types', () => {
        // Valid input provider types
        expect(isConstant.configInputProvider('prompts')).toBe(true);
        expect(isConstant.configInputProvider('filePath')).toBe(true);
      });

      it('should reject invalid input provider types', () => {
        // Invalid input provider types
        expect(isConstant.configInputProvider('invalid')).toBe(false);
        expect(isConstant.configInputProvider('')).toBe(false);
        expect(isConstant.configInputProvider(null)).toBe(false);
        expect(isConstant.configInputProvider(undefined)).toBe(false);
        expect(isConstant.configInputProvider(42)).toBe(false);
        expect(isConstant.configInputProvider({})).toBe(false);
      });
    });

    describe('license', () => {
      it('should validate the correct license object', () => {
        // Valid license object
        expect(isConstant.license(LICENSE)).toBe(true);
        expect(
          isConstant.license({
            type: 'GPLv2+',
            url: 'https://www.gnu.org/licenses/gpl-2.0.html'
          })
        ).toBe(true);
      });

      it('should reject invalid license objects', () => {
        // Invalid license objects
        expect(
          isConstant.license({
            type: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          })
        ).toBe(false);
        expect(isConstant.license({ type: 'GPLv2+' })).toBe(false);
        expect(
          isConstant.license({
            url: 'https://www.gnu.org/licenses/gpl-2.0.html'
          })
        ).toBe(false);
        expect(isConstant.license({})).toBe(false);
        expect(isConstant.license(null)).toBe(false);
        expect(isConstant.license(undefined)).toBe(false);
        expect(isConstant.license('GPLv2+')).toBe(false);
      });
    });

    describe('version', () => {
      describe('base', () => {
        it('should validate the correct base version', () => {
          expect(isConstant.version.base(VERSIONS.base)).toBe(true);
          expect(isConstant.version.base('0.0.0')).toBe(true);
        });

        it('should reject invalid base versions', () => {
          expect(isConstant.version.base('1.0.0')).toBe(false);
          expect(isConstant.version.base('')).toBe(false);
          expect(isConstant.version.base(null)).toBe(false);
          expect(isConstant.version.base(undefined)).toBe(false);
          expect(isConstant.version.base(0)).toBe(false);
        });
      });

      describe('wp', () => {
        it('should validate the correct WordPress version', () => {
          expect(isConstant.version.wp(VERSIONS.wp)).toBe(true);
          expect(isConstant.version.wp('6.7.0')).toBe(true);
        });

        it('should reject invalid WordPress versions', () => {
          expect(isConstant.version.wp('5.9.0')).toBe(false);
          expect(isConstant.version.wp('')).toBe(false);
          expect(isConstant.version.wp(null)).toBe(false);
          expect(isConstant.version.wp(undefined)).toBe(false);
          expect(isConstant.version.wp(6.7)).toBe(false);
        });
      });

      describe('php', () => {
        it('should validate the correct PHP version', () => {
          expect(isConstant.version.php(VERSIONS.php)).toBe(true);
          expect(isConstant.version.php('8.0.0')).toBe(true);
        });

        it('should reject invalid PHP versions', () => {
          expect(isConstant.version.php('7.4.0')).toBe(false);
          expect(isConstant.version.php('')).toBe(false);
          expect(isConstant.version.php(null)).toBe(false);
          expect(isConstant.version.php(undefined)).toBe(false);
          expect(isConstant.version.php(8.0)).toBe(false);
        });
      });

      describe('wpBlockApi', () => {
        it('should validate the correct WP Block API version', () => {
          expect(isConstant.version.wpBlockApi(VERSIONS.wpBlockApi)).toBe(true);
          expect(isConstant.version.wpBlockApi(3)).toBe(true);
        });

        it('should reject invalid WP Block API versions', () => {
          expect(isConstant.version.wpBlockApi(2)).toBe(false);
          expect(isConstant.version.wpBlockApi(0)).toBe(false);
          expect(isConstant.version.wpBlockApi('3')).toBe(false);
          expect(isConstant.version.wpBlockApi(null)).toBe(false);
          expect(isConstant.version.wpBlockApi(undefined)).toBe(false);
        });
      });
    });
  });
});
