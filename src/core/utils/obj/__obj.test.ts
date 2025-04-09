import { describe, expect, it } from 'vitest';
import * as Obj from './obj.js';

describe('Obj', () => {
  describe('is', () => {
    it('returns true for objects', () => {
      expect(Obj.is({})).toBe(true);
      expect(Obj.is({ a: 1 })).toBe(true);
    });
    it('returns false for non-objects', () => {
      expect(Obj.is(42)).toBe(false);
      expect(Obj.is('string')).toBe(false);
      expect(Obj.is(null)).toBe(false);
      expect(Obj.is(undefined)).toBe(false);
    });
  });
  describe('isStrKeyOf', () => {
    it('returns true for string properties', () => {
      const obj = { name: 'test', age: 30 };
      expect(Obj.isStrKeyOf('name', obj)).toBe(true);
      expect(Obj.isStrKeyOf('age', obj)).toBe(true);
    });
    it('returns false for non-string properties', () => {
      const obj = { name: 'test', age: 30 };
      expect(Obj.isStrKeyOf('nonExistent', obj)).toBe(false);
    });
  });
  describe('isPartialOf', () => {
    // Basic test cases
    it('should return true when partial is a subset of established', () => {
      const established = { name: 'test', age: 30, details: { level: 5 } };
      const partial = { name: 'test' };
      expect(Obj.isPartialOf(partial, established)).toBe(true);
    });

    it('should return true for empty object as partial', () => {
      const established = { name: 'test', age: 30 };
      const partial = {};
      expect(Obj.isPartialOf(partial, established)).toBe(true);
    });

    // Type checking tests
    it('should return false when types are different', () => {
      const established = { name: 'test', age: 30 };
      const partial = { name: 42 }; // Different type
      expect(Obj.isPartialOf(partial, established)).toBe(false);
    });

    // Non-object tests
    it('should return false when partial is not an object', () => {
      const established = { name: 'test' };
      expect(Obj.isPartialOf(null, established)).toBe(false);
      expect(Obj.isPartialOf(undefined, established)).toBe(false);
      expect(Obj.isPartialOf('string', established)).toBe(false);
      expect(Obj.isPartialOf(42, established)).toBe(false);
    });

    it('should return false when established is not an object', () => {
      const partial = { name: 'test' };
      expect(Obj.isPartialOf(partial, null)).toBe(false);
      expect(Obj.isPartialOf(partial, undefined)).toBe(false);
      expect(Obj.isPartialOf(partial, 'string')).toBe(false);
      expect(Obj.isPartialOf(partial, 42)).toBe(false);
    });

    // Extra properties tests
    it('should return false when partial has properties not in established', () => {
      const established = { name: 'test', age: 30 };
      const partial = { name: 'test', email: 'test@example.com' }; // Extra property
      expect(Obj.isPartialOf(partial, established)).toBe(false);
    });

    // Array handling test
    it('should handle arrays correctly', () => {
      const established = { items: [1, 2, 3] };
      const partial = { items: [1] };
      // Note: This test will fail with the current implementation
      // as arrays are compared by type only, not content
      expect(Obj.isPartialOf(partial, established)).toBe(true);
    });

    // Nested objects test
    it('should check types in nested objects', () => {
      const established = { user: { name: 'test', age: 30 } };
      const goodPartial = { user: { name: 'other' } };
      const badPartial = { user: { name: 42 } }; // Wrong type

      expect(Obj.isPartialOf(goodPartial, established)).toBe(true);
      expect(Obj.isPartialOf(badPartial, established)).toBe(false);
    });
  });
  describe('clone', () => {
    it('returns non object input', () => {
      expect(Obj.clone(42)).toBe(42);
    });
    it('clones primitive values', () => {
      const input = { a: 1, b: 'string', c: true };
      const result = Obj.clone(input);
      expect(result).toEqual(input);
      expect(result).not.toBe(input);
    });
    it('clones nested objects', () => {
      const input = { a: { b: { c: 1 } } };
      const result = Obj.clone(input);
      expect(result).toEqual(input);
      expect(result.a).not.toBe(input.a);
      expect(result.a.b).not.toBe(input.a.b);
    });
    it('clones arrays', () => {
      const input = [1, 2, [3, 4]];
      const result = Obj.clone(input);
      expect(result).toEqual(input);
      expect(result).not.toBe(input);
      expect(result[2]).not.toBe(input[2]);
    });
    it('clones objects with arrays', () => {
      const input = { arr: [{ a: 1 }, { b: 2 }] };
      const result = Obj.clone(input);
      expect(result).toEqual(input);
      expect(result.arr).not.toBe(input.arr);
      expect(result.arr[0]).not.toBe(input.arr[0]);
    });
  });
  describe('merge', () => {
    it('returns non object input', () => {
      expect(Obj.merge(42, 42)).toBe(42);
    });
    it('merges top-level properties', () => {
      const provided = { a: 1, b: 2 };
      const established = { b: 3, c: 4 };
      const result = Obj.merge(established, provided);
      expect(result).toEqual({ a: 1, b: 2, c: 4 });
    });
    it('merges nested objects', () => {
      const provided = { nested: { a: 1, b: 2 } };
      const established = { nested: { b: 3, c: 4 } };
      const result = Obj.merge(established, provided);
      expect(result).toEqual({ nested: { a: 1, b: 2, c: 4 } });
    });
    it('handles arrays with objects', () => {
      const provided = { arr: [{ a: 1 }, { b: 2 }] };
      const established = { arr: [{ c: 3 }] };
      const result = Obj.merge(established, provided);
      expect(result).toEqual({ arr: [{ a: 1 }, { b: 2 }] });
      // Verify array references are new
      expect(result.arr).not.toBe(provided.arr);
      expect(result.arr).not.toBe(established.arr);
    });

    it('preserves non-overlapping properties', () => {
      const provided = { a: { x: 1 } };
      const established = { b: { y: 2 } };
      const result = Obj.merge(established, provided);
      expect(result).toEqual({ a: { x: 1 }, b: { y: 2 } });
    });
  });
  describe('freeze', () => {
    it('freezes nested objects', () => {
      const testObj = { level1: { level2: { value: 'test' } } };
      const frozen = Obj.freeze(testObj, { maxDepth: Infinity });
      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.level1)).toBe(true);
      expect(Object.isFrozen(frozen.level1.level2)).toBe(true);
    });
    it('handles non-object values', () => {
      const values = [42, 'string', null, undefined];
      values.forEach((value) => {
        expect(Obj.freeze(value)).toBe(value);
      });
    });
    it('preserves object structure', () => {
      const original = {
        string: 'value',
        number: 42,
        nested: { key: 'value' }
      };
      const frozen = Obj.freeze(original);
      expect(frozen).toEqual(original);
    });
    it('prevents modifications', () => {
      const frozen = Obj.freeze(
        { key: { nested: 'value' } },
        { maxDepth: Infinity }
      );
      expect(() => {
        frozen.key.nested = 'new value';
      }).toThrowError();
    });
    it('handles already frozen objects', () => {
      const frozen1 = Object.freeze({ key: 'value' });
      const frozen2 = Obj.freeze(frozen1);
      expect(frozen2).toBe(frozen1);
    });
    it('clones when prompted', () => {
      const original = { key: 'value' };
      const frozen = Obj.freeze(original, { clone: true });
      expect(frozen).not.toBe(original);
      expect(frozen).toEqual(original);
    });
  });
  describe('utils', () => {
    it('properly checks if an object is empty', () => {
      expect(Obj.isEmpty({})).toBe(true);
      expect(Obj.isEmpty({ a: 1 })).toBe(false);
    });
    it('returns typed keys for valid object', () => {
      const obj = { a: 1, b: 'string', c: true };
      const keys = Obj.keys(obj);
      expect(keys).toEqual(['a', 'b', 'c']);
    });
    it('returns empty array for invalid object', () => {
      const obj = 42;
      const keys = Obj.keys(obj);
      expect(keys).toEqual([]);
    });
  });
});
