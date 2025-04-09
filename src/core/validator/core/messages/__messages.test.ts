import { describe, expect, it } from 'vitest';
import { mustBe } from './messages.js';

describe('msgs.ts', () => {
  describe('condApply', () => {
    describe('pre', () => {
      it('should apply message with item', () => {
        expect(mustBe.aNumber('Value')).toBe('Value must be a number');
      });

      it('should return just message without item', () => {
        expect(mustBe.aNumber()).toBe('must be a number');
      });
    });

    describe('post', () => {
      it('should apply message with item', () => {
        expect(mustBe.atLeast('this', '10')).toBe('this must be at least 10');
      });

      it('should return just message without item', () => {
        expect(mustBe.atLeast()).toBe('must be at least');
      });
    });
  });

  describe('mustBe', () => {
    it('should create generic be message', () => {
      expect(mustBe._('this', 'valid')).toBe('this must be valid');
      expect(mustBe._()).toBe('must be');
    });

    it('should create semver message', () => {
      expect(mustBe.aSemver('Version')).toContain(
        'https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string'
      );
      expect(mustBe.aSemver()).toContain(
        'https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string'
      );
    });

    it('should create number message', () => {
      expect(mustBe.aNumber('Count')).toBe('Count must be a number');
      expect(mustBe.aNumber()).toBe('must be a number');
    });

    it('should create finiteNum message', () => {
      expect(mustBe.aFiniteNum('Value')).toBe('Value must be a finite number');
      expect(mustBe.aFiniteNum()).toBe('must be a finite number');
    });

    it('should create positiveNum message', () => {
      expect(mustBe.aPositiveNum('Count')).toBe(
        'Count must be a positive number'
      );
      expect(mustBe.aPositiveNum()).toBe('must be a positive number');
    });

    it('should create negativeNum message', () => {
      expect(mustBe.aNegativeNum('Temperature')).toBe(
        'Temperature must be a negative number'
      );
      expect(mustBe.aNegativeNum()).toBe('must be a negative number');
    });

    it('should create array message', () => {
      expect(mustBe.anArray('Items')).toBe('Items must be an array');
      expect(mustBe.anArray()).toBe('must be an array');
    });

    it('should create object message', () => {
      expect(mustBe.anObject('Config')).toBe('Config must be an object');
      expect(mustBe.anObject()).toBe('must be an object');
    });

    it('should create string message', () => {
      expect(mustBe.aString('Name')).toBe('Name must be a string');
      expect(mustBe.aString()).toBe('must be a string');
    });

    it('should create url message', () => {
      expect(mustBe.aUrl('Website')).toBe('Website must be a url');
      expect(mustBe.aUrl()).toBe('must be a url');
    });

    it('should create email message', () => {
      expect(mustBe.anEmail('Contact')).toBe(
        'Contact must be an email address'
      );
      expect(mustBe.anEmail()).toBe('must be an email address');
    });

    it('should create empty message', () => {
      expect(mustBe.empty('List')).toBe('List must be empty');
      expect(mustBe.empty()).toBe('must be empty');
    });

    it('should create notEmpty message', () => {
      expect(mustBe.notEmpty('Name')).toBe('Name must not be empty');
      expect(mustBe.notEmpty()).toBe('must not be empty');
    });

    it('should create notNaN message', () => {
      expect(mustBe.notNaN('Result')).toBe('Result must not be NaN');
      expect(mustBe.notNaN()).toBe('must not be NaN');
    });

    it('should create atLeast message', () => {
      expect(mustBe.atLeast('', '10')).toBe('must be at least 10');
      expect(mustBe.atLeast()).toBe('must be at least');
    });

    it('should create atMost message', () => {
      expect(mustBe.atMost('this', '100')).toBe('this must be at most 100');
      expect(mustBe.atMost()).toBe('must be at most');
    });
    it('should create function message', () => {
      expect(mustBe.aFunction('Count')).toBe('Count must be a function');
      expect(mustBe.aFunction()).toBe('must be a function');
    });
  });
});
