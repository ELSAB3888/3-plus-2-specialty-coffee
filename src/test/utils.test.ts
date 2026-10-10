import { describe, it, expect } from 'vitest';
import { formatPrice, slugify, localized } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('formats price in English with EGP', () => {
      expect(formatPrice(18, 'en')).toBe('EGP 18');
      expect(formatPrice(24.5, 'en')).toBe('EGP 24.5');
    });

    it('formats price in Arabic with ج.م', () => {
      expect(formatPrice(18, 'ar')).toBe('18 ج.م');
      expect(formatPrice(24.5, 'ar')).toBe('24.5 ج.م');
    });
  });

  describe('slugify', () => {
    it('generates clean URL slugs', () => {
      expect(slugify('Espresso Bar')).toBe('espresso-bar');
      expect(slugify('Single-Origin & Manual Brew!')).toBe('single-origin-manual-brew');
    });
  });

  describe('localized', () => {
    const item = {
      name_en: 'Flat White',
      name_ar: 'فلات وايت',
      description_en: 'Velvety espresso drink',
      description_ar: 'مشروب إسبريسو مخملي',
    };

    it('returns English string when language is en', () => {
      expect(localized(item, 'name', 'en')).toBe('Flat White');
      expect(localized(item, 'description', 'en')).toBe('Velvety espresso drink');
    });

    it('returns Arabic string when language is ar', () => {
      expect(localized(item, 'name', 'ar')).toBe('فلات وايت');
      expect(localized(item, 'description', 'ar')).toBe('مشروب إسبريسو مخملي');
    });

    it('returns empty string gracefully if null', () => {
      expect(localized(null, 'name', 'en')).toBe('');
    });
  });
});
