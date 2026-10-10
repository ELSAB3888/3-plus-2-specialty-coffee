import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { localized, cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  extrasCount?: number;
}

export function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
  extrasCount = 0,
}: CategoryNavProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view smoothly
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategoryId]);

  return (
    <div className="sticky top-16 z-30 bg-brand-cream-50/95 backdrop-blur-md border-b border-brand-cream-300/80 py-3 transition-shadow shadow-xs">
      <div className="menu-container">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1"
        >
          {/* "All" pill */}
          <button
            type="button"
            data-active={activeCategoryId === null}
            onClick={() => onSelectCategory(null)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200',
              activeCategoryId === null
                ? 'bg-brand-olive text-brand-cream shadow-brand-sm'
                : 'bg-white/80 text-brand-olive-700 hover:bg-white hover:text-brand-olive-900 border border-brand-cream-300'
            )}
          >
            {t('common.allCategories')}
          </button>

          {/* Category pills */}
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                data-active={isActive}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-olive text-brand-cream shadow-brand-sm'
                    : 'bg-white/80 text-brand-olive-700 hover:bg-white hover:text-brand-olive-900 border border-brand-cream-300'
                )}
              >
                {localized(category, 'name', language)}
              </button>
            );
          })}

          {/* Extras Pill */}
          {extrasCount > 0 && (
            <button
              type="button"
              data-active={activeCategoryId === 'extras'}
              onClick={() => onSelectCategory('extras')}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200',
                activeCategoryId === 'extras'
                  ? 'bg-brand-gold text-brand-espresso font-semibold shadow-brand-sm'
                  : 'bg-white/80 text-brand-gold hover:bg-white border border-brand-cream-300'
              )}
            >
              {t('menu.extras')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
