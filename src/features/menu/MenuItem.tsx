import { ChevronDown, Sparkles, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { localized, formatPrice, cn } from '@/lib/utils';
import type { Product, ProductSize } from '@/types';

const BASE = import.meta.env.BASE_URL; // e.g. '/' or '/repo-name/'

/** Prefix a local asset path with Vite's base so it resolves on GitHub Pages */
function assetUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  // Already absolute URL (http/https) — leave as is
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Already prefixed — leave as is
  if (src.startsWith(BASE)) return src;
  // Strip leading slash then prepend BASE
  return BASE + src.replace(/^\//, '');
}

interface MenuItemProps {
  product: Product;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function MenuItem({ product, isExpanded, onToggleExpand }: MenuItemProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const name = localized(product, 'name', language);
  const description = localized(product, 'description', language);

  const sizes: ProductSize[] = product.sizes || product.product_sizes || [];
  const hasMultipleSizes = sizes.length > 1;

  // Compute display price
  const availableSizes = sizes.filter((s) => s.is_available);
  const pricingSizes = availableSizes.length > 0 ? availableSizes : sizes;
  const minPrice = pricingSizes.length > 0 ? Math.min(...pricingSizes.map((s) => s.price)) : 0;
  const singlePrice = sizes[0]?.price ?? 0;

  // Image path: prefer local image path, fallback to image_url
  const imageSrc = assetUrl(product.image || product.image_url);

  return (
    <div
      className={cn(
        'group transition-all duration-300 rounded-brand overflow-hidden',
        isExpanded ? 'bg-white shadow-brand-md p-4 my-3 ring-1 ring-brand-olive-200' : 'py-3 hover:bg-brand-cream-100/60 px-2'
      )}
    >
      {/* Header line: Title + Dotted Leader + Price */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-start flex items-baseline justify-between gap-2 focus:outline-hidden"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 min-w-0 shrink">
          <span className="font-serif font-semibold text-base md:text-lg text-brand-espresso group-hover:text-brand-olive transition-colors">
            {name}
          </span>
          {product.is_featured && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-brand-gold/15 text-brand-gold shrink-0"
              title={t('common.featured')}
            >
              <Sparkles size={10} />
            </span>
          )}
        </div>

        {/* Elegant Dotted Leader Line */}
        <div
          className="flex-1 mx-2 md:mx-4 border-b border-dotted border-brand-olive-300/60 self-center relative -top-0.5 transition-opacity opacity-70 group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* Price display */}
        <div className="flex items-center gap-2 shrink-0">
          {hasMultipleSizes && (
            <span className="text-[11px] md:text-xs text-brand-olive-400 font-normal">
              {t('menu.startingFrom')}
            </span>
          )}
          <span className="font-serif font-bold text-sm md:text-base text-brand-olive-700">
            {formatPrice(hasMultipleSizes ? minPrice : singlePrice, language)}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'text-brand-olive-400 transition-transform duration-300',
              isExpanded && 'rotate-180 text-brand-olive'
            )}
          />
        </div>
      </button>

      {/* Short teaser description (when collapsed) */}
      {!isExpanded && description && (
        <p className="text-xs text-brand-olive-500/80 mt-1 line-clamp-1 max-w-[85%]">
          {description}
        </p>
      )}

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-brand-cream-300 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Image */}
            {imageSrc ? (
              <div className="sm:w-36 h-36 shrink-0 rounded-brand overflow-hidden shadow-brand-sm bg-brand-cream-100">
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="sm:w-36 h-28 sm:h-36 shrink-0 rounded-brand bg-brand-cream-200/70 flex items-center justify-center">
                <Coffee size={32} className="text-brand-olive-300" />
              </div>
            )}

            {/* Description & Sizes */}
            <div className="flex-1 min-w-0 space-y-3">
              {description && (
                <p className="text-xs md:text-sm text-brand-olive-600 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Sizes breakdown */}
              {sizes.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[11px] font-semibold text-brand-olive-400 uppercase tracking-wider">
                    {hasMultipleSizes ? t('menu.sizes') : t('menu.singleSize')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sizes.map((size: ProductSize) => (
                      <div
                        key={size.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-brand-cream-100/70 border border-brand-cream-300 text-xs"
                      >
                        <span className="font-medium text-brand-espresso">
                          {localized(size, 'label', language)}
                        </span>
                        <span className="font-serif font-bold text-brand-olive">
                          {formatPrice(size.price, language)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
