import { describe, it, expect } from 'vitest';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';

describe('Bilingual Content & Brand Identity', () => {
  it('contains the mandatory brand story "3 Sisters, 2 Brothers" in English', () => {
    expect(en.common.story).toBe('3 Sisters, 2 Brothers');
    expect(en.home.storyBadge).toBe('3 Sisters, 2 Brothers');
  });

  it('contains the mandatory brand tagline "One Perfect Cup" in English', () => {
    expect(en.common.tagline).toBe('One Perfect Cup');
    expect(en.home.tagline).toBe('One Perfect Cup');
  });

  it('contains the mandatory brand story in Arabic', () => {
    expect(ar.common.story).toBe('٣ أخوات، أخوان اثنان');
    expect(ar.home.storyBadge).toBe('٣ أخوات، أخوان اثنان');
  });

  it('contains the mandatory brand tagline in Arabic', () => {
    expect(ar.common.tagline).toBe('كوب واحد متقن');
    expect(ar.home.tagline).toBe('كوب واحد متقن');
  });

  it('has consistent keys between English and Arabic dictionaries', () => {
    expect(Object.keys(en.common)).toEqual(Object.keys(ar.common));
    expect(Object.keys(en.menu)).toEqual(Object.keys(ar.menu));
    expect(Object.keys(en.admin)).toEqual(Object.keys(ar.admin));
  });
});
