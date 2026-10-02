import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, formatTime, formatDate, generateId, truncate, debounce, throttle } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
    });

    it('merges tailwind classes with tailwind-merge', () => {
      expect(cn('p-2 p-4')).toBe('p-4');
    });
  });

  describe('formatTime', () => {
    it('formats milliseconds to seconds', () => {
      expect(formatTime(500)).toBe('0s');
      expect(formatTime(1500)).toBe('1s');
      expect(formatTime(59999)).toBe('59s');
    });

    it('formats milliseconds to minutes', () => {
      expect(formatTime(60000)).toBe('1m 0s');
      expect(formatTime(90000)).toBe('1m 30s');
      expect(formatTime(3599999)).toBe('59m 59s');
    });

    it('formats milliseconds to hours', () => {
      expect(formatTime(3600000)).toBe('1h 0m 0s');
      expect(formatTime(7200000)).toBe('2h 0m 0s');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
      expect(truncate('hi', 10)).toBe('hi');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('only calls once for multiple rapid calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      debounced();
      debounced();
      
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('limits function execution rate', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      
      throttled();
      throttled();
      throttled();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});