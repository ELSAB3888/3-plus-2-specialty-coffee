import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Leaf, Flame, Droplets, Star, Coffee } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useFeaturedProducts } from '@/hooks/useData';
import { localized, formatPrice, cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL;

/** Prefix a local asset path with Vite's base so it resolves on GitHub Pages */
function assetUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith(BASE)) return src;
  return BASE + src.replace(/^\//, '');
}

// ─── Animated grain texture (SVG base64 inline) ───────────────────────────────
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

// ─── HomePage ──────────────────────────────────────────────────────────────────
export function HomePage() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const { products: featured, loading } = useFeaturedProducts();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Compact & Balanced
      ════════════════════════════════════════════════════════════════*/}
      <section className="relative min-h-[60vh] sm:min-h-[65vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-brand-espresso via-[#1B352E] to-brand-olive-800 py-16 sm:py-20">
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat' }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

        {/* Central hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
          {/* Specialty badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-gold/20 text-brand-gold-light text-[11px] font-semibold tracking-widest uppercase mb-5 animate-fade-in-up">
            <Star size={11} className="fill-current" />
            Specialty Coffee · Egypt
          </div>

          {/* Logo / Brand name */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-brand-cream leading-tight tracking-tight animate-fade-in-up mb-2">
            {language === 'ar' ? (
              <>٣<span className="text-brand-gold">+</span>٢</>
            ) : (
              <>3<span className="text-brand-gold">+</span>2</>
            )}
          </h1>
          <p className="font-serif text-lg sm:text-xl text-brand-gold-light/90 font-medium mb-3 animate-fade-in-up">
            {language === 'ar' ? 'قهوة مختصة' : 'Specialty Coffee'}
          </p>

          {/* Tagline */}
          <p className="text-sm sm:text-base md:text-lg text-brand-cream-300 max-w-lg mx-auto mb-6 leading-relaxed animate-fade-in-up font-light">
            {language === 'ar'
              ? '٣ أخوات، 2أخوه — كوب واحد متقن'
              : '3 Sisters, 2 Brothers — One Perfect Cup'}
          </p>

          {/* CTA */}
          <Link
            to="/menu"
            className={cn(
              'inline-flex items-center gap-3 px-8 py-3.5 rounded-full',
              'bg-brand-gold text-brand-espresso font-semibold text-sm sm:text-base',
              'hover:bg-brand-gold-light transition-all duration-300',
              'hover:shadow-xl hover:shadow-brand-gold/30 active:scale-[0.97] animate-fade-in-up'
            )}
          >
            {t('common.viewMenu')}
            <ArrowRight
              size={18}
              className={cn('transition-transform group-hover:translate-x-1', isRTL && 'rotate-180')}
            />
          </Link>
        </div>

        {/* Decorative wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path
              d="M0 40V25C200 10 400 5 600 15C800 25 1000 35 1200 25C1320 19 1380 15 1440 10V40H0Z"
              fill="#F5F0E8"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CRAFT PHILOSOPHY
      ════════════════════════════════════════════════════════════════*/}
      <section className="py-12 md:py-16 bg-brand-cream">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-espresso mb-2">
              {t('home.qualityTitle')}
            </h2>
            <div className="w-10 h-0.5 bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Leaf, titleKey: 'quality1Title', descKey: 'quality1Desc' },
              { icon: Flame, titleKey: 'quality2Title', descKey: 'quality2Desc' },
              { icon: Droplets, titleKey: 'quality3Title', descKey: 'quality3Desc' },
            ].map((item) => (
              <div key={item.titleKey} className="text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-olive-50 flex items-center justify-center group-hover:bg-brand-olive-100 group-hover:scale-105 transition-all duration-300 shadow-brand-sm">
                  <item.icon size={24} className="text-brand-olive" />
                </div>
                <h3 className="font-serif text-base md:text-lg font-semibold text-brand-espresso mb-1.5">
                  {t(`home.${item.titleKey}`)}
                </h3>
                <p className="text-xs sm:text-sm text-brand-olive-500 leading-relaxed max-w-xs mx-auto">
                  {t(`home.${item.descKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════════════════════════════*/}
      {!loading && featured.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-y border-brand-cream-300/40">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-espresso mb-1.5">
                {t('home.featuredTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-brand-olive-400">{t('home.featuredSubtitle')}</p>
              <div className="w-10 h-0.5 bg-brand-gold mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((product) => {
                const minPrice =
                  product.sizes.length > 0
                    ? Math.min(...product.sizes.map((s) => s.price))
                    : 0;

                return (
                  <div
                    key={product.id}
                    className="rounded-brand overflow-hidden shadow-brand-sm border border-brand-cream-300 bg-brand-cream-50 hover:shadow-brand-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col"
                  >
                    {product.image ? (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={assetUrl(product.image)!}
                          alt={localized(product, 'name', language)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-brand-olive-50 to-brand-cream-200 flex items-center justify-center">
                        <Coffee size={36} className="text-brand-olive-200" />
                      </div>
                    )}

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-semibold text-brand-espresso text-sm sm:text-base mb-1">
                          {localized(product, 'name', language)}
                        </h3>
                        {(product.description_en || product.description_ar) && (
                          <p className="text-xs text-brand-olive-400 line-clamp-2 mb-2">
                            {localized(product, 'description', language)}
                          </p>
                        )}
                      </div>
                      {minPrice > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-brand-cream-200 mt-2">
                          <span className="text-[11px] text-brand-olive-400">
                            {t('menu.startingFrom')}
                          </span>
                          <span className="font-semibold text-sm text-brand-olive">
                            {formatPrice(minPrice, language)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full border border-brand-olive text-brand-olive font-medium text-xs sm:text-sm hover:bg-brand-olive hover:text-brand-cream transition-all duration-200"
              >
                {t('common.viewMenu')}
                <ArrowRight size={15} className={cn(isRTL && 'rotate-180')} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STORY SECTION
      ════════════════════════════════════════════════════════════════*/}
      <section className="py-12 md:py-16 bg-brand-cream">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-espresso mb-3">
            {t('home.storyTitle')}
          </h2>
          <div className="w-10 h-0.5 bg-brand-gold mx-auto mb-5" />
          <p className="text-sm sm:text-base text-brand-olive-600 leading-relaxed mb-6 font-light">
            {t('home.storyText')}
          </p>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full bg-brand-espresso text-brand-cream font-semibold text-xs sm:text-sm hover:bg-brand-olive-900 transition-all duration-300 hover:shadow-md"
          >
            {t('common.viewMenu')}
            <ArrowRight size={15} className={cn(isRTL && 'rotate-180')} />
          </Link>
        </div>
      </section>
    </div>
  );
}
