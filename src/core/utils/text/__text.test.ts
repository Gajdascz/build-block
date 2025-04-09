import { describe, expect, it } from 'vitest';
import { capitalize, join, kebabToPascal, slugify } from './text.js';

describe('text utils', () => {
  describe('slugify', () => {
    it('should return empty string if input is not a string', () => {
      //@ts-expect-error - Testing invalid input
      expect(slugify(42)).toBe('');
    });
    it('should convert spaces to hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('should convert multiple spaces to single hyphen', () => {
      expect(slugify('hello  world')).toBe('hello-world');
    });

    it('should convert to lowercase', () => {
      expect(slugify('HELLO World')).toBe('hello-world');
    });

    it('should remove trailing spaces', () => {
      expect(slugify(' hello world ')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(slugify('hello, world!')).toBe('hello-world');
      expect(slugify('hello/world+and&others')).toBe('hello-world-and-others');
      expect(slugify('hello?world=test')).toBe('hello-world-test');
      expect(slugify('hello_world.test<example>')).toBe(
        'hello-world-test-example'
      );
      expect(slugify('hello{world}:test;example')).toBe(
        'hello-world-test-example'
      );
      expect(
        slugify('hello\'world"test*example&test$test#test~test!test@test|test')
      ).toBe('hello-world-test-example-test-test-test-test-test-test-test');
      expect(slugify('hello[world]`test`(test)^test%test-test')).toBe(
        'hello-world-test-test-test-test-test'
      );
    });

    it('should prefix strings starting with numbers', () => {
      expect(slugify('123hello')).toBe('n123hello');
    });
  });

  describe('kebabToPascal', () => {
    it('should convert kebab case to pascal case', () => {
      expect(kebabToPascal('hello-world')).toBe('HelloWorld');
    });

    it('should handle single word', () => {
      expect(kebabToPascal('hello')).toBe('Hello');
    });

    it('should handle multiple hyphens', () => {
      expect(kebabToPascal('hello-beautiful-world')).toBe(
        'HelloBeautifulWorld'
      );
    });

    it('should convert to lowercase before transformation', () => {
      expect(kebabToPascal('HELLO-WORLD')).toBe('HelloWorld');
    });

    it('should handle special characters', () => {
      expect(kebabToPascal('hello_world.test')).toBe('HelloWorldTest');
    });

    it('should handle numbers with prefix', () => {
      expect(kebabToPascal('123-test')).toBe('N123Test');
    });
  });
  describe('join', () => {
    describe('pre', () => {
      it('should respect custom space amount', () => {
        expect(join.pre('main', 'prefix', 2)).toBe('prefix  main');
        expect(join.pre('main', 'prefix', 0)).toBe('prefixmain');
        expect(join.pre('main', 'prefix', 3)).toBe('prefix   main');
      });

      it('should handle empty strings', () => {
        expect(join.pre('prefix', '')).toBe('prefix');
        expect(join.pre('main', '')).toBe('main');
      });
    });

    describe('post', () => {
      it('should respect custom space amount', () => {
        expect(join.post('main', 'suffix', 2)).toBe('main  suffix');
        expect(join.post('main', 'suffix', 0)).toBe('mainsuffix');
        expect(join.post('main', 'suffix', 3)).toBe('main   suffix');
      });

      it('should handle empty strings', () => {
        expect(join.post('suffix', '')).toBe('suffix');
        expect(join.post('main', '')).toBe('main');
      });
    });
  });
  describe('capitalize', () => {
    it('should capitalize a string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });
  });
});
