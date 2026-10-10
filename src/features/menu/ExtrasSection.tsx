import { Sparkles, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { localized, formatPrice } from '@/lib/utils';
import type { Extra } from '@/types';

interface ExtrasSectionProps {
  extras: Extra[];
}

export function ExtrasSection({ extras }: ExtrasSectionProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const availableExtras = extras.filter((e) => e.is_available);

  if (availableExtras.length === 0) return null;

  return (
    <section id="extras-section" className="mt-14 pt-8 border-t-2 border-brand-gold/30">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-espresso text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={12} className="text-brand-gold" />
          {t('menu.extras')}
        </div>
        <h3 className="font-serif text-2xl font-bold text-brand-espresso">
          {t('menu.extrasSubtitle')}
        </h3>
        <p className="text-xs text-brand-olive-500 mt-1 max-w-md mx-auto">
          {language === 'ar'
            ? 'خيارات تخصيص إضافية تُضاف لمشروبك المفضل حسب رغبتك'
            : 'Artisan enhancements to personalize your handcrafted beverage'}
        </p>
      </div>

      {/* Extras list with Dotted Leader Lines */}
      <div className="bg-white rounded-brand shadow-brand-sm border border-brand-cream-300 p-5 md:p-6 divide-y divide-brand-cream-200">
        {availableExtras.map((extra) => (
          <div
            key={extra.id}
            className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle
                size={16}
                className="text-brand-gold shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="font-medium text-sm md:text-base text-brand-espresso group-hover:text-brand-olive transition-colors">
                {localized(extra, 'name', language)}
              </span>
            </div>

            {/* Dotted Leader Line */}
            <div
              className="flex-1 mx-3 border-b border-dotted border-brand-olive-300/60 relative -top-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />

            <span className="font-serif font-bold text-sm md:text-base text-brand-olive-700 shrink-0">
              +{formatPrice(extra.price, language)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
