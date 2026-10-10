import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Language } from '@/types';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Get the localized text based on current language */
export function localized(
  item: any,
  field: string,
  language: Language
): string {
  if (!item) return '';
  const key = `${field}_${language}`;
  const value = item[key];
  return typeof value === 'string' ? value : '';
}

/** Format price for display (SAR) */
export function formatPrice(price: number, language: Language): string {
  const formatted = price.toFixed(1);
  if (language === 'ar') {
    return `${formatted} ر.س`;
  }
  return `${formatted} SAR`;
}

/** Generate a URL-safe slug from English text */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Validate file type for image uploads */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  return validTypes.includes(file.type);
}

/** Validate file size (max 5MB by default) */
export function isValidFileSize(file: File, maxMB = 5): boolean {
  return file.size <= maxMB * 1024 * 1024;
}

/** Generate a unique filename for storage */
export function generateStorageFilename(originalName: string): string {
  const ext = originalName.split('.').pop() ?? 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}
